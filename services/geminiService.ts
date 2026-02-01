import { GoogleGenAI } from "@google/genai";
import { Settings } from "../types";

export const createClient = (apiKey: string) => {
  return new GoogleGenAI({ apiKey: apiKey.trim() });
};

export const testConnection = async (apiKey: string, modelId: string): Promise<boolean> => {
  if (!apiKey) throw new Error("Vui lòng nhập API Key.");
  
  const ai = createClient(apiKey);
  try {
    // Gửi một request siêu nhẹ để test
    await ai.models.generateContent({
      model: modelId,
      contents: "Hello",
    });
    return true;
  } catch (error: any) {
    throw handleGeminiError(error, modelId);
  }
};

const handleGeminiError = (error: any, modelId: string) => {
  console.error("Gemini API Error Detail:", error);
    
  let errorMessage = error.message || error.toString();
  
  // 1. Lỗi Model không tồn tại hoặc đã bị Google xóa (Lỗi phiên bản)
  if (errorMessage.includes('404') || errorMessage.includes('not found') || errorMessage.includes('not supported')) {
    return new Error(`Mô hình '${modelId}' không tồn tại hoặc đã bị Google thay đổi phiên bản. Vui lòng mở Cấu hình và chọn model khác (ví dụ: Gemini 2.5 Flash).`);
  }
  
  // 2. Lỗi Hết hạn mức (429 - Resource Exhausted) - Rất phổ biến với Free Tier
  if (errorMessage.includes('429') || errorMessage.includes('resource_exhausted') || errorMessage.includes('Too Many Requests')) {
    return new Error("HẾT HẠN MỨC MIỄN PHÍ (Quota Exceeded). API Key hệ thống đang bị quá tải. Vui lòng nhập API Key cá nhân của bạn để tiếp tục sử dụng.");
  }
  
  // 3. Lỗi API Key không hợp lệ (400)
  if (errorMessage.includes('400') || errorMessage.includes('API key') || errorMessage.includes('invalid argument')) {
    return new Error("API Key không hợp lệ. Nếu bạn đang dùng Key hệ thống, có thể Key đã bị hỏng. Vui lòng nhập Key cá nhân.");
  }

  // 4. Lỗi Quyền truy cập / Giới hạn tên miền (403)
  if (errorMessage.includes('403') || errorMessage.includes('permission_denied')) {
    return new Error("API Key bị từ chối (Lỗi 403). Có thể Key hệ thống bị giới hạn sai tên miền hoặc đã hết hạn. Vui lòng nhập Key cá nhân.");
  }
  
  // 5. Lỗi Mạng / CORS
  if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('fetch failed')) {
    return new Error("Lỗi kết nối mạng (CORS). Nếu đang dùng Key hệ thống, hãy thử nhập Key cá nhân của bạn.");
  }

  // 6. Lỗi quá tải server Google (503)
  if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
    return new Error("Server Google đang quá tải. Vui lòng chờ 1 lát rồi thử lại.");
  }
  
  return new Error(`Lỗi từ Google (${modelId}): ${errorMessage}`);
};

export const generateContent = async (
  modelId: string,
  prompt: string,
  apiKey: string,
  systemInstruction?: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error("Vui lòng nhập Google API Key trong phần Cấu hình để sử dụng.");
  }

  const ai = createClient(apiKey);
  
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });
    
    return response.text || "";
  } catch (error: any) {
    throw handleGeminiError(error, modelId);
  }
};

export const getSelectedModelId = (settings: Settings): string => {
  if (settings.model === 'custom' && settings.customModel) {
    return settings.customModel;
  }
  return settings.model;
};