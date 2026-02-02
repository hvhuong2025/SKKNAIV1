export interface FormData {
  title: string;
  subject: string;
  bookSet: string;
  grade: string;
  situation: string;
  solution: string;
  specificLessons: string; // Tên các bài học dùng làm ví dụ
}

export enum GenerationStep {
  IDLE = 'IDLE',
  GENERATING_OUTLINE = 'GENERATING_OUTLINE',
  GENERATING_PART_1 = 'GENERATING_PART_1',
  GENERATING_PART_2_3 = 'GENERATING_PART_2_3',
  EVALUATING = 'EVALUATING', // Bước chấm điểm
  CHECKING_PLAGIARISM = 'CHECKING_PLAGIARISM', // Bước kiểm tra đạo văn
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export type AppMode = 'generator' | 'evaluator';

export interface AppState {
  step: GenerationStep;
  progress: number;
  result: string;
  error: string | null;
}

export interface Settings {
  apiKey: string;
  model: string;
  customModel?: string;
}

export interface GenerationRequest {
  formData: FormData;
  settings: Settings;
}

export interface UploadedFile {
  name: string;
  type: 'pdf' | 'docx' | 'txt';
  content: string | ArrayBuffer; // Base64 cho PDF, Text cho Docx/Txt
  mimeType: string;
}