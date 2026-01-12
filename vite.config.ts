import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// BYOK (Bring Your Own Key) Configuration
// This app is designed for public hosting - users provide their own API keys
// No server-side API keys are required or used

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
