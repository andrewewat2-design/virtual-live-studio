import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/ws': { target: 'ws://127.0.0.1:8787', ws: true },
      '/health': { target: 'http://127.0.0.1:8787' },
      '/api': { target: 'http://127.0.0.1:8787' }
    }
  },
  preview: { host: '0.0.0.0', port: 4173, strictPort: true }
});
