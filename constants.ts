export const SKKN_MODELS = [
  // Modern Models (2.5+)
  { id: 'gemini-2.5-flash-preview-09-2025', name: 'Gemini 2.5 Flash Preview (Khuyên dùng)' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3.0 Flash Preview (Tốc độ cao)' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro Preview (Thông minh nhất)' },
  
  // Custom
  { id: 'custom', name: 'Khác (Custom Model)' },
];

export const SUBJECT_LIST = [
  "Toán",
  "Ngữ văn",
  "Tiếng Anh",
  "Khoa học tự nhiên (Lý, Hóa, Sinh)",
  "Lịch sử và Địa lí",
  "Giáo dục công dân",
  "Tin học",
  "Công nghệ",
  "Giáo dục thể chất",
  "Nghệ thuật (Âm nhạc, Mĩ thuật)",
  "Hoạt động trải nghiệm, hướng nghiệp",
  "Tiếng Việt (Tiểu học)",
  "Tự nhiên và Xã hội (Tiểu học)",
  "Đạo đức (Tiểu học)"
];

export const BOOK_SETS = [
  "Kết nối tri thức với cuộc sống",
  "Chân trời sáng tạo",
  "Cánh diều",
  "Tự do (AI tự chọn phù hợp)"
];

export const SKKN_SUGGESTIONS = [
  "Ứng dụng CNTT và AI trong giảng dạy",
  "Phương pháp dạy học theo dự án (Project-based Learning)",
  "Phát triển năng lực tự học và sáng tạo cho học sinh",
  "Giáo dục kỹ năng sống thông qua hoạt động trải nghiệm",
  "Biện pháp nâng cao chất lượng công tác chủ nhiệm lớp",
  "Tích hợp giáo dục bảo vệ môi trường trong môn học",
  "Sử dụng sơ đồ tư duy (Mindmap) để hệ thống hóa kiến thức",
  "Rèn luyện kỹ năng làm việc nhóm cho học sinh"
];

// --- CẤU HÌNH API KEY CHO CPANEL / HOSTING ---
// BƯỚC 1: Nếu bạn deploy lên cPanel và không biết cài biến môi trường, 
// hãy dán trực tiếp API Key của bạn vào giữa cặp dấu ngoặc kép bên dưới.
// Ví dụ: const HOSTING_API_KEY = "AIzaSy...";
export const HOSTING_API_KEY = ""; 

const getSystemKey = () => {
  // Ưu tiên 1: Key dán trực tiếp trong code (Dành cho cPanel/Static Hosting)
  if (HOSTING_API_KEY) return HOSTING_API_KEY;

  // Ưu tiên 2: Biến môi trường Vite (Dành cho Vercel/Netlify/Docker)
  try {
    const meta = import.meta as any;
    if (meta && meta.env && meta.env.VITE_API_KEY) {
      return meta.env.VITE_API_KEY;
    }
  } catch (e) {}

  // Ưu tiên 3: Biến môi trường Node/Process (Fallback)
  try {
    if (typeof process !== 'undefined' && process.env) {
      if (process.env.VITE_API_KEY) return process.env.VITE_API_KEY;
      if (process.env.NEXT_PUBLIC_API_KEY) return process.env.NEXT_PUBLIC_API_KEY;
      if (process.env.REACT_APP_API_KEY) return process.env.REACT_APP_API_KEY;
    }
  } catch (e) {}

  return "";
};

export const SYSTEM_API_KEY = getSystemKey();

export const SYSTEM_INSTRUCTION = `
Bạn là một chuyên gia tư vấn giáo dục Việt Nam, chuyên hỗ trợ giáo viên viết "Sáng Kiến Kinh Nghiệm" (SKKN).
Nhiệm vụ của bạn là viết các phần của SKKN dựa trên cấu trúc chuẩn của Bộ Giáo dục Đào tạo.
Văn phong phải trang trọng, sư phạm, khoa học, thực tế và thuyết phục.

QUAN TRỌNG: 
Khi đưa ra các ví dụ minh họa (giáo án, bài dạy, ngữ liệu), bạn BẮT BUỘC phải trích dẫn chính xác từ các bài học có thật trong Sách Giáo Khoa (SGK) thuộc chương trình GDPT 2018 (Kết nối tri thức, Chân trời sáng tạo, hoặc Cánh diều) tương ứng với môn học và lớp mà người dùng yêu cầu.
`;

export const OUTLINE_PROMPT = (data: { title: string; subject: string; bookSet: string; grade: string; situation: string; solution: string }) => `
Hãy lập dàn ý chi tiết (Outline) cho SKKN với thông tin sau:
- Tên sáng kiến: ${data.title}
- Môn: ${data.subject} - Lớp: ${data.grade}
- Bộ sách giáo khoa áp dụng: ${data.bookSet}
- Thực trạng: ${data.situation}
- Giải pháp chính: ${data.solution}

Yêu cầu dàn ý phải có đủ 3 phần.
**ĐẶC BIỆT CHÚ Ý VỀ FORMAT:**
- Sử dụng **Markdown Heading** (#, ##, ###) để phân chia các mục.
- **# TÊN SÁNG KIẾN** (H1)
- **## I. PHẦN MỞ ĐẦU** (H2)
- **### 1. Lý do chọn đề tài** (H3)

I. PHẦN MỞ ĐẦU (Lý do chọn đề tài, Mục đích, Đối tượng, Phạm vi).
II. PHẦN NỘI DUNG (Cơ sở lý luận, Thực trạng, Các giải pháp cụ thể 1, 2, 3..., Hiệu quả).
III. KẾT LUẬN (Bài học kinh nghiệm, Kiến nghị).

Chỉ trả về dàn ý dưới dạng Markdown, không viết lời dẫn.
`;

export const PART_1_PROMPT = (outline: string) => `
Dựa vào dàn ý sau đây, hãy viết chi tiết **I. PHẦN MỞ ĐẦU** và **II.1. Cơ sở lý luận & II.2. Thực trạng**.

Dàn ý:
${outline}

Yêu cầu:
- Sử dụng đúng thẻ **##** cho các mục lớn (VD: ## I. PHẦN MỞ ĐẦU) và **###** cho các mục nhỏ (VD: ### 1. Lý do chọn biện pháp).
- Viết sâu sắc về lý do chọn biện pháp.
- Phân tích rõ hạn chế/khó khăn của thực trạng (GV và HS) trước khi áp dụng.
`;

export const PART_2_3_PROMPT = (outline: string, part1: string, specificLessons: string) => `
Dựa vào dàn ý và phần đầu đã viết, hãy viết tiếp **II.3. Các giải pháp** và **III. KẾT LUẬN**.

Dàn ý:
${outline}

Nội dung đã viết (context):
${part1}

**THÔNG TIN BỔ SUNG QUAN TRỌNG:**
Người dùng đã cung cấp danh sách các bài học cụ thể hoặc nội dung giáo án mẫu để làm ví dụ minh họa. 
Hãy ƯU TIÊN sử dụng thông tin này để viết phần "Ví dụ minh họa" trong các giải pháp.
Thông tin bài học/ví dụ: 
"""
${specificLessons}
"""
Nếu có tài liệu đính kèm (PDF/Word content được gửi kèm prompt này), hãy phân tích kỹ nội dung đó để trích dẫn làm minh chứng thực tế.

Yêu cầu quan trọng:
- Sử dụng đúng thẻ **###** cho các biện pháp (VD: ### 3. Các giải pháp).
- Chia thành các biện pháp/giải pháp nhỏ rõ ràng.
- Mỗi biện pháp phải có: Mục tiêu -> Cách thực hiện -> **Ví dụ minh họa (Áp dụng vào bài học cụ thể người dùng cung cấp)**.
- Phần Hiệu quả: So sánh kết quả định lượng (tạo bảng số liệu giả định trươc/sau) và định tính.
- Kết luận: Khẳng định giá trị và bài học kinh nghiệm.
`;