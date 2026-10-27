import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // No GitHub Pages o site fica em /<repositorio>/; o pipeline informa via BASE_PATH.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
