import { resolve } from 'node:path';

import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ exclude: ['zutron'] })],
    build: {
      rollupOptions: {
        output: {
          format: 'es',
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin({ exclude: ['zutron'] })],
    build: {
      rollupOptions: {
        output: {
          format: 'cjs',
        },
      },
    },
  },
  renderer: {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          format: 'es',
        },
        input: {
          mainWindow: resolve(__dirname, 'src/renderer/index.html'),
          runtimeWindow: resolve(__dirname, 'src/renderer/runtimeWindow.html'),
        },
      },
    },
  },
});
