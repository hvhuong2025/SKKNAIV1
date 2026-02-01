export interface FormData {
  title: string;
  subject: string;
  bookSet: string;
  grade: string;
  situation: string;
  solution: string;
}

export enum GenerationStep {
  IDLE = 'IDLE',
  GENERATING_OUTLINE = 'GENERATING_OUTLINE',
  GENERATING_PART_1 = 'GENERATING_PART_1',
  GENERATING_PART_2_3 = 'GENERATING_PART_2_3',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

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