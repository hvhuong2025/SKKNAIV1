import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Download, Copy, Check, FileText } from 'lucide-react';
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
    // 1. Convert Markdown to clean HTML using marked
    const bodyContent = await parse(content);

    // 2. Define Standard Office CSS (Times New Roman, 14pt, Margins)
    // Margin Standard: Top 2cm, Bottom 2cm, Left 3cm, Right 1.5cm
    const cssStyle = `
      <style>
        @page {
            size: 21cm 29.7cm;
            margin: 2.0cm 1.5cm 2.0cm 3.0cm;
            mso-page-orientation: portrait;
        }
        body {
            font-family: "Times New Roman", serif;
            font-size: 14pt;
            line-height: 1.5;
            tab-interval: 36pt;
        }
        p {
            margin-top: 6pt;
            margin-bottom: 6pt;
            text-align: justify;
        }
        h1, h2, h3, h4, h5, h6 {
            font-family: "Times New Roman", serif;
            font-weight: bold;
            line-height: 1.2;
            margin-top: 12pt;
            margin-bottom: 6pt;
        }
        h1 { font-size: 16pt; text-align: center; text-transform: uppercase; }
        h2 { font-size: 14pt; }
        h3 { font-size: 14pt; font-style: italic; }
        ul, ol { margin-bottom: 12pt; }
        li { margin-bottom: 3pt; text-align: justify; }
        table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 12pt;
            border: 1px solid black;
        }
        td, th {
            border: 1px solid black;
            padding: 5pt;
            vertical-align: top;
        }
        /* Style for strong/bold */
        strong, b { font-weight: bold; }
        em, i { font-style: italic; }
      </style>
    `;

    // 3. Construct the full HTML document for Word
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

    // 4. Create Blob and Download
    const blob = new Blob(['\ufeff', fileContent], {
      type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = 'SKKN_Chuan_Dinh_Dang.doc';
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Kết quả (Có thể chỉnh sửa)
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Đã sao chép' : 'Sao chép'}
          </button>
          <button
            onClick={handleExportWord}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Xuất Word (Chuẩn Thông Tư)
          </button>
        </div>
      </div>
      
      <div className="p-6 md:p-8 min-h-[500px] prose prose-blue max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default ResultView;