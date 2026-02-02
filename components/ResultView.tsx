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
            margin: 2.0cm 2.0cm 2.0cm 3.0cm; /* Top Right Bottom Left - Chuẩn lề văn bản */
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
        
        p { 
            margin-top: 6pt; 
            margin-bottom: 6pt; 
            text-align: justify; 
            text-indent: 30pt; /* Thụt đầu dòng cho đoạn văn */
        }
        
        /* Heading Styles */
        h1, h2, h3, h4, h5, h6 { 
            font-family: "Times New Roman", serif; 
            font-weight: bold; 
            margin-top: 12pt; 
            margin-bottom: 6pt; 
            page-break-after: avoid; 
            text-indent: 0;
        }
        h1 { font-size: 16pt; text-align: center; text-transform: uppercase; }
        h2 { font-size: 14pt; text-align: left; text-transform: uppercase; }
        h3 { font-size: 14pt; text-align: left; font-weight: bold; font-style: normal; }
        h4 { font-size: 14pt; text-align: left; font-weight: bold; font-style: italic; }
        
        /* Table Styles (Chỉ áp dụng cho bảng nội dung) */
        table { 
            border-collapse: collapse; 
            width: 100%; 
            margin-top: 12pt; 
            margin-bottom: 12pt; 
            border: 1px solid windowtext; /* Windowtext là màu đen chuẩn trong Word */
        }
        td, th { 
            border: 1px solid windowtext; 
            padding: 5pt; 
            vertical-align: top; 
            text-align: left; 
        }
        th { 
            font-weight: bold; 
            background-color: #E6E6E6; /* Màu nền xám nhẹ cho header */
            text-align: center; 
            vertical-align: middle;
        }
        
        /* List Styles */
        ul, ol { margin-top: 0; margin-bottom: 0; }
        li { margin-bottom: 3pt; text-align: justify; }

        strong, b { font-weight: bold; }
        em, i { font-style: italic; }
        
        /* Loại bỏ border cho bảng chữ ký (nếu có class signature-table) */
        table.signature-table, table.signature-table td {
            border: none !important;
        }
      </style>
    `;

    // 3. Tạo phần Chữ ký (Signature Block) chuẩn văn bản hành chính
    const dateNow = new Date();
    const signatureBlock = `
      <div style="margin-top: 30pt; page-break-inside: avoid;">
        <table class="signature-table" style="width: 100%; border: none; border-collapse: collapse;">
          <tr>
            <td style="width: 40%; border: none;"></td>
            <td style="width: 60%; text-align: center; border: none;">
              <p style="margin: 0; font-style: italic; text-align: center; text-indent: 0;">Ngày ${dateNow.getDate()} tháng ${dateNow.getMonth() + 1} năm ${dateNow.getFullYear()}</p>
              <p style="margin: 5pt 0 0 0; font-weight: bold; text-transform: uppercase; text-align: center; text-indent: 0;">NGƯỜI CHẤM / NGƯỜI SOẠN THẢO</p>
              <p style="margin: 0; font-style: italic; font-size: 11pt; text-align: center; text-indent: 0;">(Ký, ghi rõ họ tên)</p>
              <br/><br/><br/><br/>
              <p style="margin: 0; font-weight: bold; text-align: center; text-indent: 0;">AI Generated Content</p>
              <p style="margin: 0; font-size: 10pt; text-align: center; text-indent: 0;">(Hệ thống AI SKKN Pro)</p>
            </td>
          </tr>
        </table>
      </div>
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
          ${signatureBlock}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', fileContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `SKKN_Result_${new Date().toISOString().slice(0,10)}.doc`;
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
              <h3 className="font-bold text-slate-800 text-sm">Văn bản kết quả</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                 <PenTool size={10} />
                 Hiển thị dạng văn bản in ấn
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
              Tải file Word (.doc)
            </button>
          </div>
        </div>
        
        {/* Document Content - Custom Render for Beautiful UI */}
        <div className="bg-white p-8 md:p-12 min-h-[800px]">
          <ReactMarkdown
            components={{
              // Custom H1
              h1: ({node, ...props}) => <h1 className="text-2xl md:text-3xl font-bold text-blue-800 uppercase text-center mb-6 mt-4 leading-relaxed" {...props} />,
              
              // Custom H2
              h2: ({node, ...props}) => <h2 className="text-xl font-bold text-slate-800 uppercase mt-8 mb-4 border-b-2 border-slate-100 pb-2 flex items-center gap-2" {...props} />,
              
              // Custom H3
              h3: ({node, ...props}) => <h3 className="text-lg font-bold text-slate-700 mt-6 mb-3" {...props} />,
              
              // Custom Paragraph
              p: ({node, ...props}) => <p className="text-slate-700 leading-7 text-justify mb-4 text-[15px]" {...props} />,
              
              // Custom Table
              table: ({node, ...props}) => (
                <div className="my-6 overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
                  <table className="w-full text-sm text-left text-slate-600 border-collapse" {...props} />
                </div>
              ),
              thead: ({node, ...props}) => <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-xs" {...props} />,
              th: ({node, ...props}) => <th className="px-6 py-4 border-b border-slate-200 border-r last:border-r-0 whitespace-nowrap bg-blue-50/50 text-blue-900" {...props} />,
              td: ({node, ...props}) => <td className="px-6 py-4 border-b border-slate-100 border-r last:border-r-0 align-top leading-6" {...props} />,
              
              // Custom List
              ul: ({node, ...props}) => <ul className="list-disc pl-6 space-y-2 mb-4 text-slate-700 marker:text-blue-500" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-6 space-y-2 mb-4 text-slate-700 marker:font-bold marker:text-slate-900" {...props} />,
              
              // Custom Blockquote
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500 pl-4 py-2 italic bg-blue-50 text-slate-700 rounded-r-lg my-4" {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
      
      {/* Decorative Shadow Layer */}
      <div className="absolute top-4 left-4 w-full h-full bg-slate-900/5 rounded-xl -z-10 blur-md"></div>
    </div>
  );
};

export default ResultView;