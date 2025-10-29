import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // 휴대폰 접속 허용
    port: 5175, // 고정 포트
    open: "/", // 자동 열기
  },
});
