import { join } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  main: {
    plugins: [tsconfigPaths(), externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        output: {
          format: 'es',
        },
      },
    },
  },
  preload: {
    plugins: [tsconfigPaths()],
    build: {
      rollupOptions: {
        output: {
          format: 'cjs',
          inlineDynamicImports: true,
        },
        // plugins: [nodeResolve()],
        // output: {
        //   format: 'es',
        // },
        plugins: [
          nodeResolve(),
          alias({
            entries: [{ find: 'tty', replacement: 'tty-browserify' }],
          }),
        ],
      },
    },
  },
  renderer: {
    plugins: [tsconfigPaths(), react()],
    publicDir: '../../resources',
    define: {
      __PLATFORM__: JSON.stringify(process.platform),
    },
    build: {
      rollupOptions: {
        input: {
          index: join(__dirname, 'src', 'renderer', 'index.html'),
        },
        output: {
          format: 'es',
        },
      },
    },
  },
});
