import React from 'react';
import { BookOpen, School, AlertCircle, Lightbulb, Sparkles, Book } from 'lucide-react';
import { FormData } from '../types';
import { SUBJECT_LIST, BOOK_SETS } from '../constants';

interface GeneratorFormProps {
  formData: FormData;
  onChange: (data: FormData) => void;
  onSubmit: () => void;
  isGenerating: boolean;
}

const GeneratorForm: React.FC<GeneratorFormProps> = ({ formData, onChange, onSubmit, isGenerating }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ ...formData, [name]: value });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Tên sáng kiến kinh nghiệm
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Ví dụ: Ứng dụng AI vào dạy Ngữ Văn 8..."
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-500" />
            Môn học
          </label>
          <select
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            {SUBJECT_LIST.map((subj) => (
              <option key={subj} value={subj}>{subj}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
             <Book className="w-4 h-4 text-indigo-500" />
             Bộ sách giáo khoa
          </label>
          <select
            name="bookSet"
            value={formData.bookSet}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            {BOOK_SETS.map((book) => (
              <option key={book} value={book}>{book}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
            <School className="w-4 h-4 text-green-500" />
            Lớp / Khối lớp
          </label>
          <input
            type="text"
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            placeholder="Ví dụ: Lớp 8"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        
        {/* Placeholder spacer for grid layout alignment if needed, or expand Grade to span 2 cols? 
            Let's keep Grade 1 col, and add a spacer or let the Textareas below take full width.
            For now, let's make Grade full width on mobile, half on desktop. 
            The previous row had Subject and BookSet. This row has Grade. It looks slightly unbalanced.
            Let's make Grade full width or move it up? 
            Actually, let's keep Grade 1 col and leave a blank space or stretch it?
            Let's stretch Grade to span full width for better aesthetics.
        */}
        <div className="col-span-1 md:col-span-1 hidden md:block">
           {/* Spacer to balance the grid if we had 4 inputs, but we have 3 short ones now. 
               Actually: Subject (1), BookSet (1). Grade (1). 
               Let's make Grade span full width to be safe.
           */}
        </div>
        
        {/* Fix: Let's reorganize.
            Row 1: Title (Full)
            Row 2: Subject (Half), BookSet (Half)
            Row 3: Grade (Full)
         */}
         
      </div>
      
      {/* Re-adjusting the Grade input to be outside the previous grid or fix the grid above */}
      <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
            <School className="w-4 h-4 text-green-500" />
            Lớp / Khối lớp
          </label>
          <input
            type="text"
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            placeholder="Ví dụ: Lớp 8"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            Thực trạng & Khó khăn
          </label>
          <textarea
            name="situation"
            value={formData.situation}
            onChange={handleChange}
            rows={3}
            placeholder="Mô tả ngắn gọn khó khăn hiện tại của GV và HS..."
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            Giải pháp chính
          </label>
          <textarea
            name="solution"
            value={formData.solution}
            onChange={handleChange}
            rows={3}
            placeholder="Mô tả ngắn gọn các giải pháp bạn muốn áp dụng..."
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={onSubmit}
          disabled={isGenerating || !formData.title}
          className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg shadow-blue-500/30 flex items-center justify-center gap-3 transition-all transform active:scale-98
            ${isGenerating || !formData.title 
              ? 'bg-slate-300 cursor-not-allowed shadow-none' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
            }`}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang suy nghĩ...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Tạo Sáng Kiến Kinh Nghiệm
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default GeneratorForm;