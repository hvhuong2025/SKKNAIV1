import React, { useRef } from 'react';
import { Upload, FileText, X, ShieldCheck, Award, ScanSearch, AlertTriangle, Info } from 'lucide-react';
import { UploadedFile } from '../types';

interface EvaluatorFormProps {
  onFilesSelected: (files: FileList) => void;
  attachedFiles: UploadedFile[];
  onRemoveFile: (index: number) => void;
  onSubmit: () => void;
  onCheckPlagiarism?: () => void; // Optional prop mới cho tính năng kiểm tra
  isEvaluating: boolean;
}

const EvaluatorForm: React.FC<EvaluatorFormProps> = ({
  onFilesSelected,
  attachedFiles,
  onRemoveFile,
  onSubmit,
  onCheckPlagiarism,
  isEvaluating
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
    }
    // Reset giá trị input để có thể chọn lại cùng 1 file nếu lỡ xóa nhầm
    e.target.value = '';
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-white p-6 md:p-10 mb-8 relative overflow-hidden group">
      {/* Decorative Top Line - Green for Evaluation */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500"></div>

      <div className="relative z-10">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          Hội đồng Chấm & Thẩm định SKKN (AI)
        </h3>
        
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-sm">
           <p className="font-bold flex items-center gap-2 mb-2">
              <Award size={16} /> Tiêu chí chấm (Thang 100 điểm):
           </p>
           <ul className="list-disc pl-5 space-y-1 text-slate-600">
             <li><strong>Nội dung (90đ):</strong> Tính mới (20), Khoa học (25), Thực tiễn (20), Hiệu quả (25).</li>
             <li><strong>Hình thức (10đ):</strong> Bố cục, ngôn ngữ, thể thức trình bày.</li>
           </ul>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
            Tải lên File SKKN cần chấm (Word/PDF)
          </label>
          
          <div 
            onClick={triggerFileUpload}
            className="w-full h-[180px] border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/30 hover:bg-emerald-50 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group/upload relative overflow-hidden"
          >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".pdf,.docx,.txt" 
              />
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-4 group-hover/upload:scale-110 transition-transform">
                    <Upload size={28} className="text-emerald-500" />
                </div>
                <p className="text-sm font-bold text-slate-700 group-hover/upload:text-emerald-700 transition-colors">
                  Chọn file từ máy tính
                </p>
                <p className="text-xs text-slate-500 mt-2">Hỗ trợ .DOCX, .PDF (Tối đa 10MB)</p>
              </div>
          </div>

          {/* File List */}
          {attachedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
                {attachedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white border border-emerald-200 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                          <FileText size={20} className="text-emerald-600" />
                        </div>
                        <div>
                           <p className="truncate font-bold text-slate-800 text-sm max-w-[200px] md:max-w-md">{file.name}</p>
                           <p className="text-xs text-slate-400 uppercase">{file.type}</p>
                        </div>
                    </div>
                    <button 
                      onClick={() => onRemoveFile(idx)}
                      className="p-2 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nút Chấm Điểm */}
          <button
            onClick={onSubmit}
            disabled={isEvaluating || attachedFiles.length === 0}
            className={`w-full py-4 rounded-2xl font-bold text-lg text-white shadow-xl flex items-center justify-center gap-3 transition-all duration-300 transform relative overflow-hidden group/btn
              ${isEvaluating || attachedFiles.length === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:shadow-emerald-500/40 hover:-translate-y-1 active:scale-98 active:translate-y-0'
              }`}
          >
             {!(isEvaluating || attachedFiles.length === 0) && (
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12"></div>
             )}
            
            {isEvaluating ? (
               <span className="text-sm">Đang xử lý...</span>
            ) : (
              <>
                <ShieldCheck className="w-6 h-6" />
                <span>Chấm điểm</span>
              </>
            )}
          </button>

          {/* Nút Kiểm Tra Đạo Văn (Mới) */}
          <button
            onClick={onCheckPlagiarism}
            disabled={isEvaluating || attachedFiles.length === 0}
            className={`w-full py-4 rounded-2xl font-bold text-lg text-white shadow-xl flex items-center justify-center gap-3 transition-all duration-300 transform relative overflow-hidden group/btn-warning
              ${isEvaluating || attachedFiles.length === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:shadow-orange-500/40 hover:-translate-y-1 active:scale-98 active:translate-y-0'
              }`}
          >
             {!(isEvaluating || attachedFiles.length === 0) && (
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn-warning:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12"></div>
             )}
            
            {isEvaluating ? (
               <span className="text-sm">Đang xử lý...</span>
            ) : (
              <>
                <ScanSearch className="w-6 h-6" />
                <span>Kiểm tra Đạo văn</span>
              </>
            )}
          </button>
        </div>
        
        {/* Lưu ý chi tiết về Đạo văn */}
        <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-4 md:p-5">
           <h4 className="text-amber-800 font-bold flex items-center gap-2 mb-3 text-sm md:text-base">
             <AlertTriangle size={18} />
             Lưu ý quan trọng: AI có kiểm tra được đạo văn không?
           </h4>
           <div className="text-sm text-slate-700 space-y-3 text-justify">
             <p>
               <span className="font-bold text-amber-700">Có và Không:</span> Gemini AI không phải là công cụ quét trùng lặp truyền thống (như Turnitin) vì nó không lưu trữ bản sao của mọi văn bản trên internet để so sánh từng câu chữ theo thời gian thực.
             </p>
             <p>
               <span className="font-bold text-amber-700">Thế mạnh của AI:</span> Nó cực kỳ giỏi phát hiện <strong>"Văn mẫu" (Generic Content)</strong> và <strong>Sự thiếu logic</strong>. AI sẽ nhận diện ngay lập tức các đoạn văn sáo rỗng, cấu trúc rập khuôn, hoặc số liệu mâu thuẫn (VD: Đoạn trên nói lớp 8, đoạn dưới nói lớp 9) thường thấy trong các bài copy/paste.
             </p>
             <div className="bg-white/60 p-3 rounded-lg border border-amber-200">
               <span className="font-bold text-amber-700">Hiệu quả thực tế:</span> Đạt khoảng <strong>70-80%</strong> trong việc phát hiện các bài "xào nấu", cắt ghép sơ sài. Đây là công cụ hỗ trợ Hội đồng lọc nhanh các bài kém chất lượng, nhưng không thay thế hoàn toàn việc thẩm định chuyên môn.
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default EvaluatorForm;