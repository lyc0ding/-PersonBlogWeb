import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    hmr:true,
    // 代理端口，不设置默认为当前浏览器运行端口
    port:5173,
    proxy: {
      '/api': {
        // 后端接口url
        target: 'http://localhost:5959',
        // 去掉url 上的 /api
        rewrite: path => path.replace(/^\/api/, '')
      },
      '/files': {
        target: 'http://localhost:5959'
      }
    }
  },
})
