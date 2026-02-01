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

// --- CẤU HÌNH API KEY HỆ THỐNG ---
const getSystemKey = () => {
  // CHUẨN HÓA: Ưu tiên tuyệt đối cho VITE_API_KEY theo yêu cầu.
  
  // 1. Kiểm tra môi trường Vite (import.meta.env)
  try {
    const meta = import.meta as any;
    // Vite injects env variables into import.meta.env
    if (meta && meta.env && meta.env.VITE_API_KEY) {
      return meta.env.VITE_API_KEY;
    }
  } catch (e) {
    // Ignore if not in a module environment
  }

  // 2. Fallback: Kiểm tra process.env (Node.js / Build Tools)
  // Vẫn ưu tiên VITE_API_KEY nếu được inject vào process.env
  try {
    if (typeof process !== 'undefined' && process.env) {
      if (process.env.VITE_API_KEY) return process.env.VITE_API_KEY;
      
      // Các fallback khác (nếu cần thiết cho tương thích ngược)
      if (process.env.NEXT_PUBLIC_API_KEY) return process.env.NEXT_PUBLIC_API_KEY;
      if (process.env.REACT_APP_API_KEY) return process.env.REACT_APP_API_KEY;
    }
  } catch (e) {}

  return "";
};

// QUAN TRỌNG: 
// Trên Netlify/Vercel: Vào Settings -> Environment Variables.
// Thêm biến mới: Key = VITE_API_KEY, Value = [API Key của bạn]
// Sau đó bắt buộc phải Redeploy (Build lại) ứng dụng.
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

Yêu cầu dàn ý phải có đủ 3 phần:
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
- Viết sâu sắc về lý do chọn biện pháp.
- Phân tích rõ hạn chế/khó khăn của thực trạng (GV và HS) trước khi áp dụng.
- Dùng định dạng Markdown.
`;

export const PART_2_3_PROMPT = (outline: string, part1: string) => `
Dựa vào dàn ý và phần đầu đã viết, hãy viết tiếp **II.3. Các giải pháp** và **III. KẾT LUẬN**.

Dàn ý:
${outline}

Nội dung đã viết (để tham khảo context, không lặp lại):
${part1}

Yêu cầu quan trọng về Ví Dụ Minh Họa:
- Chia thành các biện pháp/giải pháp nhỏ rõ ràng (Biện pháp 1, Biện pháp 2...).
- Mỗi biện pháp phải có: Mục tiêu -> Cách thực hiện -> Ví dụ minh họa.
- **VÍ DỤ MINH HỌA:** Phải lấy từ bài học cụ thể trong bộ sách giáo khoa đã chọn (hoặc bộ sách phổ biến nếu chọn tự do).
  * Ví dụ: Nếu môn Ngữ Văn 8 (Kết nối tri thức), hãy lấy ví dụ từ văn bản "Lá cờ thêu sáu chữ vàng" hoặc "Quang Trung đại phá quân Thanh" v.v...
  * Nếu môn Toán, hãy lấy bài tập hoặc tình huống trong SGK thực tế.
- Phần Hiệu quả: So sánh kết quả định lượng (tạo bảng số liệu giả định trươc/sau) và định tính.
- Kết luận: Khẳng định giá trị và bài học kinh nghiệm.
- Dùng định dạng Markdown.
`;