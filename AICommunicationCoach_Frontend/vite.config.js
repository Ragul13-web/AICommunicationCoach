import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Only allow the specific Vercel host
    allowedHosts: ['sb-4819dbggh53j.vercel.run'], 
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'https://localhost:5001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
