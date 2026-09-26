import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // SPA mode: serve index.html for all non-asset routes (required for React Router)
  appType: 'spa',
  server: {
    port: 5173,
    strictPort: true,
  },
})
