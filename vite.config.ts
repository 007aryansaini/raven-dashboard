import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const SCORE_API_HOST = 'http://provider.h100.hou.sfc.akash.pub:31548'
const CHAT_API_HOST = 'http://fiavciu9p1ds9es595v2smmhes.ingress.h100.hou.sfc.akash.pub'
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
      '/polymarket-api': {
        target: 'https://gamma-api.polymarket.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/polymarket-api/, ''),
        secure: true,
      },
    },
  },
})
