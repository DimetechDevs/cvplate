import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // The PDF engine and pdf.js worker are large by nature and load only once a CV is open.
    chunkSizeWarningLimit: 1400,
  },
})
