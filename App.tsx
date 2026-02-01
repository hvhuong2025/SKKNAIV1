import React, { useState, useCallback, useEffect } from 'react';
import { Settings as SettingsIcon, Sparkles, AlertTriangle, Phone, Facebook, Youtube, Wrench } from 'lucide-react';
import SettingsModal from './components/SettingsModal';
import GeneratorForm from './components/GeneratorForm';
import ResultView from './components/ResultView';
import { SYSTEM_INSTRUCTION, OUTLINE_PROMPT, PART_1_PROMPT, PART_2_3_PROMPT, SYSTEM_API_KEY } from './constants';
import { generateContent, getSelectedModelId } from './services/geminiService';
import { FormData, Settings, GenerationStep } from './types';

const App: React.FC = () => {
  // Initialize settings from localStorage OR use SYSTEM_API_KEY
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem('skkn_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If saved key is empty but we have a system key, use system key
        if (!parsed.apiKey && SYSTEM_API_KEY) {
          return { ...parsed, apiKey: SYSTEM_API_KEY };
        }
        return parsed;
      }
      // Default initialization
      return { 
        model: 'gemini-2.5-flash-preview-09-2025', 
        apiKey: SYSTEM_API_KEY || '', 
        customModel: '' 
      };
    } catch (e) {
      return { model: 'gemini-2.5-flash-preview-09-2025', apiKey: SYSTEM_API_KEY || '', customModel: '' };
    }
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    subject: 'Ngữ văn',
    bookSet: 'Kết nối tri thức với cuộc sống',
    grade: '',
    situation: '',
    solution: '',
  });

  const [step, setStep] = useState<GenerationStep>(GenerationStep.IDLE);
  const [result, setResult] = useState<string>('');
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Persistence effect
  useEffect(() => {
    localStorage.setItem('skkn_settings', JSON.stringify(settings));
  }, [settings]);

  // Only open settings if NO key is available at all
  useEffect(() => {
    if (!settings.apiKey) {
      setIsSettingsOpen(true);
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!formData.title) return;
    
    if (!settings.apiKey) {
      setIsSettingsOpen(true);
      setError("Vui lòng nhập API Key trước khi bắt đầu.");
      return;
    }

    setStep(GenerationStep.GENERATING_OUTLINE);
    setError(null);
    setResult('');
    
    try {
      const modelId = getSelectedModelId(settings);
      
      // Step 1: Outline
      setProgressMsg('Đang lập dàn ý chi tiết...');
      const outlinePrompt = OUTLINE_PROMPT(formData);
      const outline = await generateContent(modelId, outlinePrompt, settings.apiKey, SYSTEM_INSTRUCTION);
      
      setResult((prev) => prev + `### DÀN Ý DỰ KIẾN\n\n${outline}\n\n---\n\n`);

      // Step 2: Part 1
      setStep(GenerationStep.GENERATING_PART_1);
      setProgressMsg('Đang viết Phần I & II (Thực trạng)...');
      const part1Prompt = PART_1_PROMPT(outline);
      const part1 = await generateContent(modelId, part1Prompt, settings.apiKey, SYSTEM_INSTRUCTION);
      
      setResult((prev) => prev + `${part1}\n\n`);

      // Step 3: Part 2 & 3
      setStep(GenerationStep.GENERATING_PART_2_3);
      setProgressMsg(`Đang viết Giải pháp & Kết luận (Tham chiếu sách ${formData.bookSet})...`);
      const part23Prompt = PART_2_3_PROMPT(outline, part1);
      const part23 = await generateContent(modelId, part23Prompt, settings.apiKey, SYSTEM_INSTRUCTION);
      
      setResult((prev) => prev + `${part23}`);
      
      setStep(GenerationStep.COMPLETED);
      setProgressMsg('');

    } catch (err: any) {
      setStep(GenerationStep.ERROR);
      
      let finalErrorMsg = err.message || "Có lỗi xảy ra trong quá trình tạo.";
      
      // LOGIC QUAN TRỌNG:
      // Nếu đang dùng SYSTEM_API_KEY mà gặp lỗi -> Báo user nhập key riêng.
      if (SYSTEM_API_KEY && settings.apiKey === SYSTEM_API_KEY) {
        console.warn("System Key failed. Prompting user for personal key.");
        finalErrorMsg = `⚠️ Key mặc định (VITE_API_KEY) đang quá tải hoặc gặp sự cố.\n\nĐể tiếp tục, vui lòng NHẬP API KEY CÁ NHÂN của bạn trong phần Cấu hình.\n(Chi tiết lỗi: ${err.message})`;
      }

      setError(finalErrorMsg);
    }
  }, [formData, settings]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent hidden md:block">
              AI SKKN Generator Pro - Soạn Giảng TV
            </h1>
             <h1 className="text-sm md:text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent md:hidden whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
              AI SKKN - Soạn Giảng TV
            </h1>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${!settings.apiKey ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            {!settings.apiKey && <AlertTriangle size={18} />}
            <span className="font-medium text-sm hidden sm:inline">{!settings.apiKey ? 'Cấu hình ngay' : 'Cấu hình'}</span>
            <SettingsIcon size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 flex-grow">
        
        <div className="mb-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Trợ lý viết Sáng Kiến Kinh Nghiệm
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Hệ thống sử dụng AI thế hệ mới để hỗ trợ giáo viên xây dựng SKKN chuẩn cấu trúc Bộ GD&ĐT nhanh chóng và hiệu quả.
          </p>
        </div>

        {!settings.apiKey && (
           <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start gap-3">
             <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
             <div>
               <strong>Chưa cấu hình API Key:</strong> Ứng dụng cần Google Gemini API Key để hoạt động. Vui lòng nhấn vào nút "Cấu hình ngay" ở góc trên để cài đặt.
             </div>
           </div>
        )}

        {/* Form Section */}
        <GeneratorForm 
          formData={formData} 
          onChange={setFormData} 
          onSubmit={handleGenerate} 
          isGenerating={step !== GenerationStep.IDLE && step !== GenerationStep.COMPLETED && step !== GenerationStep.ERROR}
        />

        {/* Progress & Error */}
        {step !== GenerationStep.IDLE && step !== GenerationStep.COMPLETED && step !== GenerationStep.ERROR && (
           <div className="mb-8 bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center justify-center gap-3 text-blue-700 animate-pulse">
             <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
             <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
             <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
             <span className="font-medium">{progressMsg}</span>
           </div>
        )}

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 p-6 rounded-xl text-red-800 text-center flex flex-col items-center justify-center gap-4 shadow-sm animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
               <AlertTriangle size={24} className="text-red-600" />
               <span>Đã xảy ra lỗi</span>
            </div>
            <p className="text-slate-700 bg-white/60 px-4 py-3 rounded-lg border border-red-100 w-full whitespace-pre-wrap">
               {error}
            </p>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 shadow-md hover:shadow-lg transform active:scale-95"
            >
              <Wrench size={18} />
              Nhập API Key Cá Nhân Ngay
            </button>
          </div>
        )}

        {/* Result Section */}
        {result && (
          <ResultView content={result} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="font-bold text-slate-800 mb-4 text-lg">Phát triển bởi Admin Soạn Giảng TV</p>
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 text-sm">
            <a href="https://zalo.me/0355936256" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-full transition-colors border border-slate-200 hover:border-blue-200">
              <Phone size={18} className="text-blue-600" />
              <span className="font-medium">Zalo/ĐT: 0355936256</span>
            </a>
            
            <a href="https://www.facebook.com/vanhuong1982" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-full transition-colors border border-slate-200 hover:border-blue-200">
              <Facebook size={18} className="text-blue-600" />
              <span className="font-medium">Facebook</span>
            </a>

            <a href="https://www.youtube.com/@SO%E1%BA%A0NGI%E1%BA%A2NGTV" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-700 rounded-full transition-colors border border-slate-200 hover:border-red-200">
              <Youtube size={18} className="text-red-600" />
              <span className="font-medium">Soạn Giảng TV</span>
            </a>

             <a href="https://www.youtube.com/@soangiangofficial" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-700 rounded-full transition-colors border border-slate-200 hover:border-red-200">
              <Youtube size={18} className="text-red-600" />
              <span className="font-medium">Soạn Giảng Official</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings}
        onSave={setSettings}
      />
    </div>
  );
};

export default App;