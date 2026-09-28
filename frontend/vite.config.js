import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'three': path.resolve(__dirname, '../node_modules/three'),
      '@react-three/fiber': path.resolve(__dirname, '../node_modules/@react-three/fiber'),
      '@react-three/drei': path.resolve(__dirname, '../node_modules/@react-three/drei'),
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
