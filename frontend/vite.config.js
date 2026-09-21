import { defineConfig, loadEnv } from 'vite';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  // In development the API is proxied through Vite so the browser treats the
  // frontend and the API as the same origin and session cookies just work.
  const devApiTarget = env.VITE_DEV_API_PROXY || 'http://localhost:4000';

  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: { '@': path.resolve(import.meta.dirname, './src') },
    },

    server: {
      port: 5173,
      proxy: {
        '/api': { target: devApiTarget, changeOrigin: true },
      },
    },

    build: {
      // Route-level code splitting is done with React.lazy; this keeps the
      // three large third-party libraries out of the entry chunk as well.
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router'],
            motion: ['motion/react'],
          },
        },
      },
    },
  };
});
