import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: resolve(__dirname, 'test-app'),
  plugins: [react()],
  server: {
    port: 5174,
  },
  resolve: {
    alias: {
      'serpentine-border': resolve(__dirname, 'src/index.js'),
    },
  },
})
