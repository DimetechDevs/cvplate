import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pages serves the site from /cvplate/; local dev and other hosts use the root.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  build: {
    // The PDF engine and pdf.js worker are large by nature and load only once a CV is open.
    chunkSizeWarningLimit: 1400,
  },
})
