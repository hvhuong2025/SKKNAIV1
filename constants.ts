export const SKKN_MODELS = [
  // Modern Models (2.5+)
  { id: 'gemini-2.5-flash-preview-09-2025', name: 'Gemini 2.5 Flash Preview (Khuyên dùng)' },
  { id: 'gemini-2.5-pro-preview-09-2025', name: 'Gemini 2.5 Pro Preview (Mạnh mẽ & Sáng tạo)' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3.0 Flash Preview (Tốc độ cao)' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro Preview (Thông minh nhất)' },
  
  // Custom
  { id: 'custom', name: 'Khác (Custom Model)' },
];

export const SUBJECT_LIST = [
  "Công tác Chủ nhiệm lớp",
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
  "Chương trình Hoạt động trải nghiệm / Hướng nghiệp",
  "Tài liệu Giáo dục Kỹ năng sống / Đạo đức",
  "Không áp dụng (Dành cho GV Chủ nhiệm / Quản lý)",
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

QUAN TRỌNG VỀ FORMAT OUTPUT:
1. Tuyệt đối KHÔNG viết lời dẫn chuyện, lời chào hỏi hay giải thích (Ví dụ: KHÔNG viết "Dưới đây là nội dung...", "Chắc chắn rồi...", "Bài viết như sau...").
2. Chỉ trả về NỘI DUNG CHUYÊN MÔN bắt đầu bằng các thẻ Markdown Heading (#, ##, ###).
3. Khi đưa ra các ví dụ minh họa (giáo án, bài dạy, ngữ liệu), bạn BẮT BUỘC phải trích dẫn chính xác từ các bài học có thật trong Sách Giáo Khoa (SGK) thuộc chương trình GDPT 2018 (Kết nối tri thức, Chân trời sáng tạo, hoặc Cánh diều) tương ứng với môn học và lớp mà người dùng yêu cầu.
`;

export const EVALUATOR_SYSTEM_INSTRUCTION = `
Bạn là Chủ tịch Hội đồng Khoa học cấp Phòng/Sở Giáo dục & Đào tạo. Nhiệm vụ của bạn là CHẤM ĐIỂM và ĐÁNH GIÁ Sáng kiến kinh nghiệm (SKKN) của giáo viên một cách khách quan, công tâm và chính xác dựa trên thang điểm quy định.

Bạn cần phân tích kỹ nội dung văn bản SKKN được cung cấp, đối chiếu với các tiêu chí chấm, sau đó lập "PHIẾU CHẤM ĐIỂM" và đưa ra "NHẬN XÉT CHI TIẾT".
Tuyệt đối KHÔNG viết lời dẫn thừa thãi.
`;

export const OUTLINE_PROMPT = (data: { title: string; subject: string; bookSet: string; grade: string; situation: string; solution: string }) => `
Hãy lập dàn ý chi tiết (Outline) cho SKKN với thông tin sau:
- Tên sáng kiến: ${data.title}
- Môn/Lĩnh vực: ${data.subject} - Lớp: ${data.grade}
- Bộ sách giáo khoa/Tài liệu áp dụng: ${data.bookSet}
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

Yêu cầu output:
- Bắt đầu ngay bằng: **## I. PHẦN MỞ ĐẦU**.
- KHÔNG lặp lại tên đề tài ở đầu.
- KHÔNG viết lời dẫn.
- Viết sâu sắc về lý do chọn biện pháp.
- Phân tích rõ hạn chế/khó khăn của thực trạng (GV và HS) trước khi áp dụng.
`;

export const PART_2_3_PROMPT = (outline: string, part1: string, specificLessons: string) => `
Dựa vào dàn ý và phần đầu đã viết, hãy viết TIẾP NỐI LIỀN MẠCH sang **II.3. Các giải pháp** và **III. KẾT LUẬN**.

Dàn ý tham khảo:
${outline}

Nội dung phần trước (Context):
${part1}

**THÔNG TIN BỔ SUNG QUAN TRỌNG:**
Người dùng đã cung cấp danh sách các bài học cụ thể, chủ đề sinh hoạt hoặc nội dung giáo án mẫu để làm ví dụ minh họa. 
Hãy ƯU TIÊN sử dụng thông tin này để viết phần "Ví dụ minh họa" trong các giải pháp.
Thông tin bài học/ví dụ: 
"""
${specificLessons}
"""
Nếu có tài liệu đính kèm, hãy phân tích kỹ nội dung đó để trích dẫn làm minh chứng thực tế.

Yêu cầu quan trọng:
- Bắt đầu ngay bằng: **## II.3. Các biện pháp tổ chức thực hiện** (hoặc tiêu đề tương đương trong dàn ý).
- KHÔNG viết lại phần mở đầu hay thực trạng.
- Chia thành các biện pháp/giải pháp nhỏ rõ ràng bằng thẻ **###**.
- Mỗi biện pháp phải có: Mục tiêu -> Cách thực hiện -> **Ví dụ minh họa (Áp dụng vào bài học/chủ đề cụ thể người dùng cung cấp)**.
- Phần Hiệu quả: So sánh kết quả định lượng (tạo bảng số liệu giả định trươc/sau) và định tính.
- Kết luận: Khẳng định giá trị và bài học kinh nghiệm.
`;

export const EVALUATION_PROMPT = `
Dựa trên nội dung file SKKN đính kèm, hãy thực hiện chấm điểm và đánh giá theo **HƯỚNG DẪN CHẤM** sau đây.

**THANG ĐIỂM VÀ TIÊU CHÍ (TỔNG 100 ĐIỂM):**

**1. Về nội dung (90 điểm):**
*   **a/ Tính mới (20 điểm):** Phát hiện vấn đề mới, giải pháp mới, tính đột phá, phù hợp thực tế.
*   **b/ Tính khoa học (25 điểm):** Đặt vấn đề gọn, rõ; Luận điểm, giải pháp cụ thể; Luận cứ, minh chứng xác thực; Bố cục logic.
*   **c/ Tính ứng dụng thực tiễn (20 điểm):** Khả thi, dễ áp dụng đại trà, được đồng nghiệp vận dụng.
*   **d/ Tính hiệu quả (25 điểm):** Hiệu quả rõ rệt trong quản lý/giảng dạy; Kết quả định lượng (số liệu) minh chứng rõ ràng.

**2. Về hình thức (10 điểm):**
*   **a/ Bố cục & Ngôn ngữ (5 điểm):** Trình bày đúng bố cục, diễn đạt chính xác, văn phong khoa học.
*   **b/ Thể thức & Trình bày (5 điểm):** Soạn thảo in ấn đẹp, không lỗi chính tả, có đóng bìa, trích dẫn tài liệu.

**3. Xếp loại:** A (85-100), B (65-84), C (50-64), KXL (<50).

---
**YÊU CẦU OUTPUT:**
Trình bày dưới dạng văn bản hành chính để in ấn.
1.  **TIÊU ĐỀ:** CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM (Căn giữa).
2.  **PHIẾU CHẤM ĐIỂM SKKN** (Tiêu đề lớn).
3.  **Thông tin chung:** Tên đề tài, Tác giả (nếu có).
4.  **BẢNG CHI TIẾT ĐIỂM (BẮT BUỘC DÙNG MARKDOWN TABLE):**
    Phải tạo một bảng có 4 cột:
    | Tiêu chí | Điểm tối đa | Điểm đạt được | Nhận xét chi tiết |
    | :--- | :---: | :---: | :--- |
    | **1. Tính mới** | 20 | ... | ... |
    | **2. Tính khoa học** | 25 | ... | ... |
    | **3. Tính ứng dụng** | 20 | ... | ... |
    | **4. Tính hiệu quả** | 25 | ... | ... |
    | **5. Hình thức** | 10 | ... | ... |
    | **TỔNG CỘNG** | **100** | **...** | **Xếp loại: ...** |

5.  **NHẬN XÉT CHUNG:** (Viết một đoạn văn đánh giá tổng quan, điểm mạnh, điểm yếu).

Lưu ý: Đóng vai giám khảo công tâm, cho điểm lẻ (ví dụ 18.5) để tăng tính thực tế. Không cần vẽ phần chữ ký (hệ thống sẽ tự thêm).
`;

export const PLAGIARISM_CHECK_PROMPT = `
Đóng vai là một "Thanh tra Chuyên môn" của Sở Giáo dục. Hãy phân tích nội dung văn bản SKKN được cung cấp dưới đây để kiểm tra **TÍNH ĐỘC BẢN** và phát hiện dấu hiệu **SAO CHÉP / VĂN MẪU**.

Bạn không cần so sánh với cơ sở dữ liệu thời gian thực, nhưng hãy dùng kiến thức của bạn về hàng triệu văn bản giáo dục đã học để đánh giá:

1.  **Phát hiện Văn mẫu (Cliché Detection):** Chỉ ra các đoạn văn có tính chất chung chung, sáo rỗng, xuất hiện nhan nhản trên mạng (ví dụ: các đoạn lý luận chung chung không gắn với thực tế đơn vị).
2.  **Kiểm tra tính Xác thực (Authenticity Check):** 
    *   Bài viết có số liệu cụ thể của năm học, lớp học, trường học không? 
    *   Có sự mâu thuẫn về số liệu hay logic không? (Ví dụ: tên trường viết tắt khác nhau, số liệu bảng trước đá bảng sau).
3.  **Đánh giá Tỷ lệ Trùng lặp (Ước tính):** Đưa ra con số ước tính % nội dung là lý thuyết chung/copy so với nội dung thực tế sáng tạo.

**YÊU CẦU OUTPUT (Trình bày dạng Báo cáo):**

# BÁO CÁO KIỂM TRA TÍNH ĐỘC BẢN SKKN

## 1. TỔNG QUAN
*   **Độ dài:** [Số lượng từ ước tính]
*   **Mức độ Sáng tạo (Originality Score):** [0 - 100%] (Điểm càng cao càng ít copy)
*   **Mức độ Văn mẫu (Generic Score):** [0 - 100%] (Điểm càng cao càng giống văn mẫu trên mạng)
*   **Kết luận sơ bộ:** [Có dấu hiệu sao chép nặng / Có tham khảo nhưng có sáng tạo / Bài viết độc bản cao]

## 2. CHI TIẾT CÁC VẤN ĐỀ PHÁT HIỆN
(Tạo bảng Markdown)
| Vấn đề | Vị trí / Đoạn văn nghi vấn | Nhận định của AI |
| :--- | :--- | :--- |
| **Văn mẫu sáo rỗng** | "..." | [Giải thích tại sao đoạn này giống văn mẫu] |
| **Dữ liệu chung chung** | "..." | [Thiếu tên trường, lớp cụ thể...] |
| **Logic bất thường** | "..." | [Nếu có mâu thuẫn số liệu/tên gọi] |

## 3. KHUYẾN NGHỊ CHO TÁC GIẢ
*   [Lời khuyên 1]
*   [Lời khuyên 2]

*Lưu ý: Kết quả này dựa trên phân tích văn phong và dữ liệu nội tại, không phải là bằng chứng pháp lý về đạo văn.*
`;