import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const SCORE_API_HOST = 'http://provider.h100.ams2.val.akash.pub:32700'
const CHAT_API_HOST = 'http://lj1mfoucldabr4ji897gq875i8.ingress.h100.ams2.val.akash.pub'
const BACKEND_HOST = 'https://agent-asva-temp.vercel.app'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/score-api': {
        target: SCORE_API_HOST,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/score-api/, ''),
      },
      '/chat-api': {
        target: CHAT_API_HOST,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/chat-api/, ''),
      },
      '/backend': {
        target: BACKEND_HOST,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/backend/, ''),
      },
    },
  },
})
