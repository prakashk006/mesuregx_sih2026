import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

const resolveModule = (name) => {
  const local = path.resolve(__dirname, 'node_modules', name);
  if (fs.existsSync(local)) return local;
  return path.resolve(__dirname, '../node_modules', name);
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'three': resolveModule('three'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
