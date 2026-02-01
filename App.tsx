import React, { useState, useCallback, useEffect } from 'react';
import { Settings as SettingsIcon, Sparkles, AlertTriangle, Wrench, Menu, Zap } from 'lucide-react';
import SettingsModal from './components/SettingsModal';
import GeneratorForm from './components/GeneratorForm';
import ResultView from './components/ResultView';
import Sidebar from './components/Sidebar';
import { SYSTEM_INSTRUCTION, OUTLINE_PROMPT, PART_1_PROMPT, PART_2_3_PROMPT, SYSTEM_API_KEY } from './constants';
import { generateContent, getSelectedModelId } from './services/geminiService';
import { FormData, Settings, GenerationStep, UploadedFile } from './types';
import mammoth from 'mammoth';

const App: React.FC = () => {
  // Logic khởi tạo Settings...
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem('skkn_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.apiKey && SYSTEM_API_KEY) {
          return { ...parsed, apiKey: SYSTEM_API_KEY };
        }
        return parsed;
      }
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State cho Mobile Sidebar
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    subject: 'Ngữ văn',
    bookSet: 'Kết nối tri thức với cuộc sống',
    grade: '',
    situation: '',
    solution: '',
    specificLessons: '',
  });

  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([]);
  const [step, setStep] = useState<GenerationStep>(GenerationStep.IDLE);
  const [result, setResult] = useState<string>('');
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Lưu settings
  useEffect(() => {
    const settingsToSave = { ...settings };
    if (SYSTEM_API_KEY && settingsToSave.apiKey === SYSTEM_API_KEY) {
      settingsToSave.apiKey = ''; 
    }
    localStorage.setItem('skkn_settings', JSON.stringify(settingsToSave));
  }, [settings]);

  // Mở Settings nếu thiếu Key
  useEffect(() => {
    if (!settings.apiKey && !SYSTEM_API_KEY) {
      setIsSettingsOpen(true);
    }
  }, [settings.apiKey]);

  // Xử lý đọc file
  const handleFilesSelected = async (fileList: FileList) => {
    const newFiles: UploadedFile[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      // Giới hạn 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} quá lớn (Max 5MB)`);
        continue;
      }

      try {
        if (file.type === 'application/pdf') {
           const base64 = await readFileAsBase64(file);
           newFiles.push({
             name: file.name,
             type: 'pdf',
             content: base64,
             mimeType: 'application/pdf'
           });
        } else if (file.name.endsWith('.docx')) {
           const arrayBuffer = await readFileAsArrayBuffer(file);
           const result = await mammoth.extractRawText({ arrayBuffer });
           newFiles.push({
             name: file.name,
             type: 'docx',
             content: result.value, // Text extracted
             mimeType: 'text/plain'
           });
        } else if (file.type === 'text/plain') {
           const text = await readFileAsText(file);
           newFiles.push({
             name: file.name,
             type: 'txt',
             content: text,
             mimeType: 'text/plain'
           });
        }
      } catch (e) {
        console.error("Error reading file", file.name, e);
      }
    }
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = useCallback(async () => {
    if (!formData.title) return;
    
    const activeKey = settings.apiKey || SYSTEM_API_KEY;
    if (!activeKey) {
      setIsSettingsOpen(true);
      setError("Vui lòng nhập API Key trong phần Cấu hình để bắt đầu.");
      return;
    }

    setStep(GenerationStep.GENERATING_OUTLINE);
    setError(null);
    setResult('');
    
    try {
      const modelId = getSelectedModelId(settings);
      
      // Bước 1: Dàn ý
      setProgressMsg('Đang lập dàn ý chi tiết...');
      const outlinePrompt = OUTLINE_PROMPT(formData);
      const outline = await generateContent(modelId, outlinePrompt, activeKey, SYSTEM_INSTRUCTION);
      
      setResult((prev) => prev + `### DÀN Ý DỰ KIẾN\n\n${outline}\n\n---\n\n`);

      // Bước 2: Phần 1 & 2
      setStep(GenerationStep.GENERATING_PART_1);
      setProgressMsg('Đang viết Phần I & II (Thực trạng)...');
      const part1Prompt = PART_1_PROMPT(outline);
      const part1 = await generateContent(modelId, part1Prompt, activeKey, SYSTEM_INSTRUCTION);
      
      setResult((prev) => prev + `${part1}\n\n`);

      // Bước 3: Phần 3 & Kết luận (Multimodal)
      setStep(GenerationStep.GENERATING_PART_2_3);
      setProgressMsg(`Đang viết Giải pháp & Kết luận (Phân tích tài liệu đính kèm nếu có)...`);
      
      // Chuẩn bị nội dung cho Phần 3
      // Gom Text từ file DOCX/TXT vào prompt string luôn để AI dễ hiểu context
      let textFromFile = "";
      const pdfParts: any[] = [];
      
      attachedFiles.forEach(file => {
        if (file.type === 'pdf') {
          pdfParts.push({
            inlineData: {
              mimeType: file.mimeType,
              data: file.content
            }
          });
        } else {
          // DOCX hoặc TXT
          textFromFile += `\n\n--- NỘI DUNG TỪ FILE: ${file.name} ---\n${file.content}\n---------------------\n`;
        }
      });

      const specificLessonsContext = formData.specificLessons + textFromFile;
      const part23PromptText = PART_2_3_PROMPT(outline, part1, specificLessonsContext);

      // Tạo Payload gửi cho Gemini
      // Cấu trúc: [ { text: "..." }, { inlineData: ... }, { inlineData: ... } ]
      const finalParts = [
        { text: part23PromptText },
        ...pdfParts
      ];

      const part23 = await generateContent(modelId, finalParts, activeKey, SYSTEM_INSTRUCTION);
      
      setResult((prev) => prev + `${part23}`);
      
      setStep(GenerationStep.COMPLETED);
      setProgressMsg('');

    } catch (err: any) {
      setStep(GenerationStep.ERROR);
      
      let finalErrorMsg = err.message || "Có lỗi xảy ra trong quá trình tạo.";
      const activeKey = settings.apiKey || SYSTEM_API_KEY;

      if (SYSTEM_API_KEY && activeKey === SYSTEM_API_KEY) {
        console.warn("System Key failed. Prompting user for personal key.");
        finalErrorMsg = `⚠️ Key hệ thống mặc định đang quá tải hoặc gặp sự cố.\n\nĐể tiếp tục sử dụng ngay, vui lòng NHẬP API KEY CÁ NHÂN của bạn trong phần Cấu hình.\n(Chi tiết lỗi: ${err.message})`;
      }

      setError(finalErrorMsg);
    }
  }, [formData, settings, attachedFiles]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden relative">
      {/* Background Decor Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-3xl pointer-events-none mix-blend-multiply"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-3xl pointer-events-none mix-blend-multiply"></div>
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-200/20 rounded-full blur-3xl pointer-events-none mix-blend-multiply"></div>

      {/* Sidebar - Slider Trái */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        
        {/* Header - Glassmorphism */}
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm shrink-0 transition-all duration-300">
          <div className="max-w-6xl mx-auto px-4 h-18 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Nút Menu cho Mobile */}
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 hover:bg-slate-100/80 rounded-xl text-slate-600 transition-colors"
              >
                <Menu size={24} />
              </button>

              <div className="flex items-center gap-3 group cursor-default">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                  <Sparkles size={20} className="animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-violet-700 bg-clip-text text-transparent hidden lg:block tracking-tight">
                    AI SKKN Generator <span className="text-amber-500 font-extrabold text-sm align-top ml-0.5">PRO</span>
                  </h1>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent lg:hidden whitespace-nowrap">
                    AI SKKN
                  </h1>
                  <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase hidden lg:block">Soạn Giảng TV Official</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 border shadow-sm
                ${(!settings.apiKey && !SYSTEM_API_KEY) 
                  ? 'bg-red-50 text-red-600 border-red-200 animate-pulse hover:bg-red-100' 
                  : 'bg-white/80 hover:bg-white border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:shadow-md'}`}
            >
              {(!settings.apiKey && !SYSTEM_API_KEY) && <AlertTriangle size={18} />}
              <span className="font-semibold text-sm hidden sm:inline">{(!settings.apiKey && !SYSTEM_API_KEY) ? 'Cấu hình ngay' : 'Cấu hình'}</span>
              <SettingsIcon size={18} className={(!settings.apiKey && !SYSTEM_API_KEY) ? '' : 'group-hover:rotate-90 transition-transform duration-500'} />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
          <div className="max-w-5xl mx-auto pb-12">
            
            <div className="mb-10 text-center relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wide mb-4 shadow-sm">
                <Zap size={12} fill="currentColor" />
                Trợ lý AI Thế hệ mới
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">
                Viết Sáng Kiến Kinh Nghiệm <br/>
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
                  Chuyên Nghiệp & Tốc Độ
                </span>
              </h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                Hệ thống AI tự động xây dựng nội dung chuẩn cấu trúc Bộ GD&ĐT, giúp giáo viên tiết kiệm 90% thời gian soạn thảo.
              </p>
            </div>

            {(!settings.apiKey && !SYSTEM_API_KEY) && (
               <div className="mb-8 p-4 bg-amber-50/80 backdrop-blur-sm border border-amber-200 rounded-2xl text-amber-800 flex items-start gap-4 shadow-sm">
                 <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0 text-amber-600">
                    <AlertTriangle className="w-5 h-5" />
                 </div>
                 <div>
                   <h4 className="font-bold text-amber-900">Yêu cầu cấu hình</h4>
                   <p className="text-sm mt-1">Ứng dụng cần Google Gemini API Key để hoạt động. Vui lòng nhấn vào nút "Cấu hình ngay" ở góc trên để cài đặt.</p>
                 </div>
               </div>
            )}

            {/* Form Section */}
            <div className="transition-all duration-500 ease-out transform translate-y-0 opacity-100">
              <GeneratorForm 
                formData={formData} 
                onChange={setFormData} 
                onSubmit={handleGenerate} 
                isGenerating={step !== GenerationStep.IDLE && step !== GenerationStep.COMPLETED && step !== GenerationStep.ERROR}
                onFilesSelected={handleFilesSelected}
                attachedFiles={attachedFiles}
                onRemoveFile={handleRemoveFile}
              />
            </div>

            {/* Progress & Error */}
            {step !== GenerationStep.IDLE && step !== GenerationStep.COMPLETED && step !== GenerationStep.ERROR && (
               <div className="mb-8 bg-white/80 backdrop-blur border border-blue-100 p-6 rounded-2xl flex flex-col items-center justify-center gap-4 text-blue-800 shadow-lg shadow-blue-500/10">
                 <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
                    </div>
                 </div>
                 <div className="text-center">
                    <span className="font-bold text-lg block mb-1">{progressMsg}</span>
                    <span className="text-sm text-blue-500">AI đang suy nghĩ và soạn thảo văn bản...</span>
                 </div>
               </div>
            )}

            {error && (
              <div className="mb-8 bg-red-50/90 backdrop-blur border border-red-100 p-6 rounded-2xl text-red-800 text-center flex flex-col items-center justify-center gap-4 shadow-lg shadow-red-500/10 animate-in fade-in slide-in-from-top-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
                   <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-900">Đã xảy ra lỗi</h3>
                  <p className="text-red-700 mt-1 max-w-lg mx-auto bg-white/50 px-4 py-2 rounded-lg border border-red-100 text-sm">
                    {error}
                  </p>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg transform active:scale-95 flex items-center gap-2"
                >
                  <Wrench size={18} />
                  Sửa lỗi trong Cấu hình
                </button>
              </div>
            )}

            {/* Result Section */}
            {result && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <ResultView content={result} />
              </div>
            )}
          </div>
        </main>
      </div>

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