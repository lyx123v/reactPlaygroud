import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer';


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), visualizer()],
  base: './',
  build: {
    outDir: 'dist',
    minify: 'esbuild', // 压缩
    terserOptions: {
      compress: {
        drop_console: true, // 删除console
        drop_debugger: true, // 删除debugger
      },
    },
    rollupOptions: {
      output: {
        format: 'module',
        chunkFileNames: 'js/[name].[hash].js',
        entryFileNames: 'js/[name].[hash].js',
      },
    },
  },
})
