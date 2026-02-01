import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // QUAN TRỌNG: base: './' giúp đường dẫn assets trở thành tương đối (ví dụ: "assets/index.js" thay vì "/assets/index.js").
  // Điều này cho phép ứng dụng chạy trên bất kỳ thư mục con nào hoặc Hosting cPanel mà không bị lỗi màn hình trắng.
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});