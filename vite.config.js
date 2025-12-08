import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // Chỉ load biến môi trường bắt đầu bằng VITE_
  envPrefix: 'VITE_',
})