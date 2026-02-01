import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Download, Copy, Check, FileText, PenTool } from 'lucide-react';
import { parse } from 'marked';

interface ResultViewProps {
  content: string;
}

const ResultView: React.FC<ResultViewProps> = ({ content }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportWord = async () => {
    // 1. Chuyển đổi Markdown sang HTML
    const bodyContent = await parse(content);

    // 2. Định nghĩa CSS chuẩn cho File Word (SKKN/Văn bản hành chính)
    const cssStyle = `
      <style>
        @page Section1 {
            size: 21cm 29.7cm; /* Khổ A4 */
            margin: 2.0cm 2.0cm 2.0cm 3.0cm; /* Top Right Bottom Left */
            mso-header-margin: 35.4pt;
            mso-footer-margin: 35.4pt;
            mso-paper-source: 0;
        }
        
        div.Section1 { 
            page: Section1; 
        }

        body {
            font-family: "Times New Roman", serif;
            font-size: 14pt;
            line-height: 1.5; /* Giãn dòng 1.5 */
            color: #000000;
        }
        /* ... (Giữ nguyên CSS cũ) ... */
        p { margin-top: 6pt; margin-bottom: 6pt; text-align: justify; text-indent: 1.27cm; }
        h1, h2, h3, h4, h5, h6 { font-family: "Times New Roman", serif; font-weight: bold; margin-top: 18pt; margin-bottom: 6pt; text-indent: 0cm; page-break-after: avoid; }
        h1 { font-size: 16pt; text-align: center; text-transform: uppercase; }
        h2 { font-size: 14pt; text-align: left; text-transform: uppercase; }
        h3 { font-size: 14pt; text-align: left; font-style: normal; }
        h4 { font-size: 14pt; font-style: italic; }
        ul, ol { margin-top: 0; margin-bottom: 12pt; margin-left: 1.5cm; }
        li { margin-bottom: 3pt; text-align: justify; text-indent: 0; }
        table { border-collapse: collapse; width: 100%; margin-top: 12pt; margin-bottom: 12pt; border: 1px solid black; }
        td, th { border: 1px solid black; padding: 6pt; vertical-align: top; text-align: left; text-indent: 0; }
        th { font-weight: bold; background-color: #f2f2f2; text-align: center; }
        strong, b { font-weight: bold; }
        em, i { font-style: italic; }
        a { color: blue; text-decoration: underline; }
      </style>
    `;

    const fileContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Sáng Kiến Kinh Nghiệm</title>
        ${cssStyle}
      </head>
      <body>
        <div class="Section1">
          ${bodyContent}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', fileContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `SKKN_${new Date().toISOString().slice(0,10)}.doc`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative group">
       {/* Paper Container */}
       <div className="bg-white rounded-xl shadow-2xl shadow-slate-300/60 border border-slate-200 overflow-hidden relative">
        
        {/* Modern Toolbar */}
        <div className="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-slate-100 p-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
               <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Bản thảo hoàn chỉnh</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                 <PenTool size={10} />
                 Sẵn sàng chỉnh sửa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Đã copy' : 'Sao chép'}
            </button>
            <button
              onClick={handleExportWord}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-md shadow-blue-500/20 active:scale-95"
            >
              <Download className="w-4 h-4" />
              Tải file Word
            </button>
          </div>
        </div>
        
        {/* Document Content - A4 Ratio Simulation */}
        <div className="bg-white p-8 md:p-12 min-h-[800px] prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-blue-600">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
      
      {/* Decorative Shadow Layer */}
      <div className="absolute top-4 left-4 w-full h-full bg-slate-900/5 rounded-xl -z-10 blur-md"></div>
    </div>
  );
};

export default ResultView;