import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // 修改基础路径
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name][extname]'
      }
    }
  },
  server: {
    port: 3000,
  }
}); 