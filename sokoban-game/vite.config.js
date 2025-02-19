import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // 修改基础路径
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 3000,
  }
}); 