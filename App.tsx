import React, { useState, useCallback, useEffect } from 'react';
import { Settings as SettingsIcon, Sparkles, AlertTriangle, Wrench, Menu, Zap, PenTool, ShieldCheck } from 'lucide-react';
import SettingsModal from './components/SettingsModal';
import GeneratorForm from './components/GeneratorForm';
import EvaluatorForm from './components/EvaluatorForm';
import ResultView from './components/ResultView';
import Sidebar from './components/Sidebar';
import { 
  SYSTEM_INSTRUCTION, 
  OUTLINE_PROMPT, 
  PART_1_PROMPT, 
  PART_2_3_PROMPT, 
  SYSTEM_API_KEY, 
  EVALUATOR_SYSTEM_INSTRUCTION, 
  EVALUATION_PROMPT,
  PLAGIARISM_CHECK_PROMPT
} from './constants';
import { generateContent, getSelectedModelId } from './services/geminiService';
import { FormData, Settings, GenerationStep, UploadedFile, AppMode } from './types';
import * as mammoth from 'mammoth'; // Import toàn bộ để xử lý tương thích

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

  const [mode, setMode] = useState<AppMode>('generator'); // Chế độ: Soạn thảo hoặc Chấm điểm
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    subject: 'Ngữ văn',
    bookSet: 'Kết nối tri thức với cuộc sống',
    grade: '',
    situation: '',
    solution: '',
    specificLessons: '',
  });

  // Files cho Generator
  const [generatorFiles, setGeneratorFiles] = useState<UploadedFile[]>([]);
  // Files cho Evaluator (chỉ cho phép 1 file SKKN chính để chấm)
  const [evaluatorFiles, setEvaluatorFiles] = useState<UploadedFile[]>([]);

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

  // Xử lý đọc file chung (Helper)
  const processFiles = async (fileList: FileList): Promise<UploadedFile[]> => {
    const newFiles: UploadedFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const fileName = file.name.toLowerCase();

      if (file.size > 10 * 1024 * 1024) { // Tăng giới hạn lên 10MB
        alert(`File ${file.name} quá lớn (Max 10MB)`);
        continue;
      }
      
      try {
        if (fileName.endsWith('.pdf')) {
           const base64 = await readFileAsBase64(file);
           newFiles.push({ name: file.name, type: 'pdf', content: base64, mimeType: 'application/pdf' });
        } else if (fileName.endsWith('.docx')) {
           const arrayBuffer = await readFileAsArrayBuffer(file);
           
           // Helper để lấy hàm extractRawText từ mammoth (xử lý tương thích ESM/CommonJS)
           let extractRawTextFn = mammoth.extractRawText;
           // @ts-ignore
           if (!extractRawTextFn && mammoth.default && mammoth.default.extractRawText) {
              // @ts-ignore
              extractRawTextFn = mammoth.default.extractRawText;
           }

           if (!extractRawTextFn) {
             throw new Error("Không thể tải thư viện đọc Word (mammoth). Vui lòng tải lại trang.");
           }

           const result = await extractRawTextFn({ arrayBuffer });
           if (!result.value) {
             throw new Error("File Word không có nội dung văn bản đọc được.");
           }
           newFiles.push({ name: file.name, type: 'docx', content: result.value, mimeType: 'text/plain' });
        } else if (fileName.endsWith('.txt')) {
           const text = await readFileAsText(file);
           newFiles.push({ name: file.name, type: 'txt', content: text, mimeType: 'text/plain' });
        } else {
           alert(`File ${file.name} không đúng định dạng. Chỉ hỗ trợ .DOCX (Word), .PDF hoặc .TXT.`);
        }
      } catch (e: any) {
        console.error("Error reading file", file.name, e);
        alert(`Lỗi khi đọc file ${file.name}: ${e.message || "Không xác định"}. Vui lòng thử lại hoặc dùng file PDF.`);
      }
    }
    return newFiles;
  };

  // Handler cho Generator Files
  const handleGeneratorFilesSelected = async (fileList: FileList) => {
    const files = await processFiles(fileList);
    setGeneratorFiles(prev => [...prev, ...files]);
  };

  // Handler cho Evaluator Files (Chỉ lấy 1 file mới nhất)
  const handleEvaluatorFilesSelected = async (fileList: FileList) => {
    const files = await processFiles(fileList);
    if (files.length > 0) {
      setEvaluatorFiles([files[files.length - 1]]); // Replace old file
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Kiểm tra xem result có đúng format data URL không
        if (result.includes(',')) {
            const base64 = result.split(',')[1];
            resolve(base64);
        } else {
            // Trường hợp ít gặp, trả về nguyên chuỗi hoặc handle lỗi
            resolve(result);
        }
      };
      reader.onerror = (e) => reject(new Error("Lỗi đọc file Base64"));
      reader.readAsDataURL(file);
    });
  };

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = (e) => reject(new Error("Lỗi đọc file ArrayBuffer"));
      reader.readAsArrayBuffer(file);
    });
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(new Error("Lỗi đọc file Text"));
      reader.readAsText(file);
    });
  };

  // Chức năng: SOẠN THẢO (GENERATE)
  const handleGenerate = useCallback(async () => {
    if (!formData.title) return;
    const activeKey = settings.apiKey || SYSTEM_API_KEY;
    if (!activeKey) { setIsSettingsOpen(true); setError("Vui lòng nhập API Key."); return; }

    setStep(GenerationStep.GENERATING_OUTLINE);
    setError(null);
    setResult('');
    
    try {
      const modelId = getSelectedModelId(settings);
      
      // Bước 1: Dàn ý
      // Dàn ý chỉ dùng để AI "suy nghĩ" và cho người dùng xem tạm.
      // Nó sẽ BỊ XÓA khỏi kết quả cuối cùng khi bước viết nội dung bắt đầu.
      setProgressMsg('Đang lập dàn ý chi tiết...');
      const outlinePrompt = OUTLINE_PROMPT(formData);
      const outline = await generateContent(modelId, outlinePrompt, activeKey, SYSTEM_INSTRUCTION);
      setResult(`### DÀN Ý DỰ KIẾN (Bản nháp để AI định hướng)...\n\n${outline}\n\n---\n\n`);

      // Bước 2: Phần 1 & 2
      setStep(GenerationStep.GENERATING_PART_1);
      setProgressMsg('Đang viết Phần I & II (Thực trạng)...');
      const part1Prompt = PART_1_PROMPT(outline);
      const part1 = await generateContent(modelId, part1Prompt, activeKey, SYSTEM_INSTRUCTION);
      
      // QUAN TRỌNG: GHI ĐÈ (Override) result bằng part1. 
      // Loại bỏ phần outline nháp ở bước trước để văn bản sạch sẽ.
      // Thêm tiêu đề lớn ở đầu văn bản.
      const documentTitle = `# ${formData.title.toUpperCase()}\n\n`;
      setResult(documentTitle + part1 + "\n\n");

      // Bước 3: Phần 3 & Kết luận
      setStep(GenerationStep.GENERATING_PART_2_3);
      setProgressMsg(`Đang viết Giải pháp & Kết luận (Phân tích tài liệu đính kèm)...`);
      
      let textFromFile = "";
      const pdfParts: any[] = [];
      generatorFiles.forEach(file => {
        if (file.type === 'pdf') {
          pdfParts.push({ inlineData: { mimeType: file.mimeType, data: file.content } });
        } else {
          textFromFile += `\n\n--- FILE: ${file.name} ---\n${file.content}\n---------------------\n`;
        }
      });

      const specificLessonsContext = formData.specificLessons + textFromFile;
      const part23PromptText = PART_2_3_PROMPT(outline, part1, specificLessonsContext);
      const finalParts = [{ text: part23PromptText }, ...pdfParts];

      const part23 = await generateContent(modelId, finalParts, activeKey, SYSTEM_INSTRUCTION);
      
      // Nối tiếp phần 2 vào kết quả
      setResult((prev) => prev + `${part23}`);
      setStep(GenerationStep.COMPLETED);
      setProgressMsg('');

    } catch (err: any) {
      handleError(err);
    }
  }, [formData, settings, generatorFiles]);

  // Chức năng: CHẤM ĐIỂM (EVALUATE)
  const handleEvaluate = useCallback(async () => {
    if (evaluatorFiles.length === 0) return;
    const activeKey = settings.apiKey || SYSTEM_API_KEY;
    if (!activeKey) { setIsSettingsOpen(true); setError("Vui lòng nhập API Key."); return; }

    setStep(GenerationStep.EVALUATING);
    setError(null);
    setResult('');
    setProgressMsg('Đang đọc và phân tích SKKN để chấm điểm...');

    try {
       const modelId = getSelectedModelId(settings);
       const file = evaluatorFiles[0];
       const contentParts: any[] = [];

       if (file.type === 'pdf') {
         contentParts.push({ inlineData: { mimeType: file.mimeType, data: file.content } });
         contentParts.push({ text: EVALUATION_PROMPT });
       } else {
         // Docx/Text
         const promptWithContent = `NỘI DUNG SKKN CẦN CHẤM:\n"""\n${file.content}\n"""\n\n${EVALUATION_PROMPT}`;
         contentParts.push({ text: promptWithContent });
       }

       const evaluationResult = await generateContent(modelId, contentParts, activeKey, EVALUATOR_SYSTEM_INSTRUCTION);
       setResult(evaluationResult);
       setStep(GenerationStep.COMPLETED);
       setProgressMsg('');

    } catch (err: any) {
      handleError(err);
    }

  }, [evaluatorFiles, settings]);

  // Chức năng mới: KIỂM TRA ĐẠO VĂN (CHECK PLAGIARISM)
  const handleCheckPlagiarism = useCallback(async () => {
    if (evaluatorFiles.length === 0) return;
    const activeKey = settings.apiKey || SYSTEM_API_KEY;
    if (!activeKey) { setIsSettingsOpen(true); setError("Vui lòng nhập API Key."); return; }

    setStep(GenerationStep.CHECKING_PLAGIARISM);
    setError(null);
    setResult('');
    setProgressMsg('AI đang soi từng câu chữ để phát hiện văn mẫu & sao chép...');

    try {
       const modelId = getSelectedModelId(settings);
       const file = evaluatorFiles[0];
       const contentParts: any[] = [];

       // Sử dụng Prompt kiểm tra đạo văn thay vì prompt chấm điểm
       if (file.type === 'pdf') {
         contentParts.push({ inlineData: { mimeType: file.mimeType, data: file.content } });
         contentParts.push({ text: PLAGIARISM_CHECK_PROMPT });
       } else {
         const promptWithContent = `NỘI DUNG SKKN CẦN KIỂM TRA ĐỘC BẢN:\n"""\n${file.content}\n"""\n\n${PLAGIARISM_CHECK_PROMPT}`;
         contentParts.push({ text: promptWithContent });
       }

       const checkResult = await generateContent(modelId, contentParts, activeKey, EVALUATOR_SYSTEM_INSTRUCTION);
       setResult(checkResult);
       setStep(GenerationStep.COMPLETED);
       setProgressMsg('');

    } catch (err: any) {
      handleError(err);
    }
  }, [evaluatorFiles, settings]);

  const handleError = (err: any) => {
    setStep(GenerationStep.ERROR);
    let finalErrorMsg = err.message || "Có lỗi xảy ra.";
    const activeKey = settings.apiKey || SYSTEM_API_KEY;
    if (SYSTEM_API_KEY && activeKey === SYSTEM_API_KEY) {
      finalErrorMsg = `⚠️ Key hệ thống gặp sự cố. Vui lòng NHẬP API KEY CÁ NHÂN.\n(Lỗi: ${err.message})`;
    }
    setError(finalErrorMsg);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-3xl pointer-events-none mix-blend-multiply"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-200/30 rounded-full blur-3xl pointer-events-none mix-blend-multiply"></div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onOpenSettings={() => setIsSettingsOpen(true)} />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm shrink-0">
          <div className="max-w-6xl mx-auto px-4 h-18 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 hover:bg-slate-100/80 rounded-xl text-slate-600 transition-colors"><Menu size={24} /></button>
              <div className="flex items-center gap-3 cursor-default">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Sparkles size={20} className="animate-pulse" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-violet-700 bg-clip-text text-transparent hidden lg:block">AI SKKN PRO</h1>
                  <h1 className="text-lg font-bold lg:hidden">AI SKKN</h1>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border shadow-sm ${(!settings.apiKey && !SYSTEM_API_KEY) ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-white/80 hover:bg-white border-slate-200 text-slate-600 hover:text-blue-600'}`}
            >
              <SettingsIcon size={18} />
              <span className="font-semibold text-sm hidden sm:inline">{(!settings.apiKey && !SYSTEM_API_KEY) ? 'Cấu hình ngay' : 'Cấu hình'}</span>
            </button>
          </div>
        </header>

        {/* Mode Switcher Tabs */}
        <div className="max-w-xl mx-auto mt-6 p-1 bg-slate-200/50 rounded-xl flex shadow-inner">
           <button 
             onClick={() => { setMode('generator'); setResult(''); setStep(GenerationStep.IDLE); setError(null); }}
             className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${mode === 'generator' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             <PenTool size={16} /> Soạn thảo SKKN
           </button>
           <button 
             onClick={() => { setMode('evaluator'); setResult(''); setStep(GenerationStep.IDLE); setError(null); }}
             className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${mode === 'evaluator' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             <ShieldCheck size={16} /> Chấm điểm & Thẩm định
           </button>
        </div>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
          <div className="max-w-5xl mx-auto pb-12">
            
            {/* STYLED TITLE SECTION */}
            <div className="mb-8 text-center relative z-10">
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-3 leading-tight">
                {mode === 'generator' ? (
                  <span 
                    className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600"
                    style={{ filter: 'drop-shadow(2px 2px 0px rgba(255,255,255,1)) drop-shadow(0px 0px 4px rgba(59, 130, 246, 0.3))' }}
                  >
                    VIẾT SÁNG KIẾN KINH NGHIỆM
                  </span>
                ) : (
                  <span 
                    className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 via-green-600 to-teal-600"
                    style={{ filter: 'drop-shadow(2px 2px 0px rgba(255,255,255,1)) drop-shadow(0px 0px 4px rgba(16, 185, 129, 0.3))' }}
                  >
                    HỆ THỐNG CHẤM ĐIỂM AI
                  </span>
                )}
              </h2>
              <div className="inline-block relative mt-2">
                 <p className="text-slate-600 font-medium text-lg relative z-10 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 shadow-sm inline-block">
                    {mode === 'generator' ? 'Xây dựng nội dung chuẩn cấu trúc Bộ GD&ĐT.' : 'Đánh giá, xếp loại SKKN và kiểm tra đạo văn.'}
                 </p>
              </div>
            </div>

            {/* Content Switcher */}
            {mode === 'generator' ? (
              <div className="transition-all duration-500">
                <GeneratorForm 
                  formData={formData} 
                  onChange={setFormData} 
                  onSubmit={handleGenerate} 
                  isGenerating={step !== GenerationStep.IDLE && step !== GenerationStep.COMPLETED && step !== GenerationStep.ERROR}
                  onFilesSelected={handleGeneratorFilesSelected}
                  attachedFiles={generatorFiles}
                  onRemoveFile={(idx) => setGeneratorFiles(prev => prev.filter((_, i) => i !== idx))}
                />
              </div>
            ) : (
              <div className="transition-all duration-500">
                <EvaluatorForm 
                   onFilesSelected={handleEvaluatorFilesSelected}
                   attachedFiles={evaluatorFiles}
                   onRemoveFile={(idx) => setEvaluatorFiles(prev => prev.filter((_, i) => i !== idx))}
                   onSubmit={handleEvaluate}
                   onCheckPlagiarism={handleCheckPlagiarism}
                   isEvaluating={step === GenerationStep.EVALUATING || step === GenerationStep.CHECKING_PLAGIARISM}
                />
              </div>
            )}

            {/* Progress */}
            {(step === GenerationStep.GENERATING_OUTLINE || step === GenerationStep.GENERATING_PART_1 || step === GenerationStep.GENERATING_PART_2_3 || step === GenerationStep.EVALUATING || step === GenerationStep.CHECKING_PLAGIARISM) && (
               <div className="mb-8 bg-white/80 backdrop-blur border border-blue-100 p-6 rounded-2xl flex flex-col items-center justify-center gap-4 text-blue-800 shadow-lg">
                 <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="w-6 h-6 text-blue-600 animate-pulse" /></div>
                 </div>
                 <span className="font-bold text-lg">{progressMsg}</span>
               </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-8 bg-red-50 p-6 rounded-2xl text-red-800 text-center border border-red-100 flex flex-col items-center gap-4">
                <AlertTriangle size={32} className="text-red-500" />
                <p className="font-medium">{error}</p>
                <button onClick={() => setIsSettingsOpen(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700"><Wrench size={16} /> Kiểm tra Cấu hình</button>
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <ResultView content={result} />
              </div>
            )}
          </div>
        </main>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} onSave={setSettings} />
    </div>
  );
};

export default App;