import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load .env, .env.production, .env.development...
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    define: {
      'process.env': env
    },
    envPrefix: 'VITE_',  // bắt buộc để Vite load biến env bắt đầu bằng VITE_
  }
})