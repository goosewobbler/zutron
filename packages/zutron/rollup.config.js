const sharedConfig = {
  plugins: [],
  external: ['electron', 'zustand'],
};

export default [
  {
    input: './dist/main.js',
    output: {
      file: './dist/main.cjs',
      format: 'cjs',
    },
    ...sharedConfig,
  },
  {
    input: './dist/preload.js',
    output: {
      file: './dist/preload.cjs',
      format: 'cjs',
    },
    ...sharedConfig,
  },
  {
    input: './dist/index.js',
    output: {
      file: './dist/index.cjs',
      format: 'cjs',
    },
    ...sharedConfig,
  },
];
