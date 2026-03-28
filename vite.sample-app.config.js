import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: resolve(__dirname, 'sample-app'),
  plugins: [react()],
  server: {
    port: 5175,
    open: true,
  },
  resolve: {
    alias: {
      'serpentine-border': resolve(__dirname, 'src/index.js'),
    },
  },
})
