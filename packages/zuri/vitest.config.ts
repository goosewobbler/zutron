import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.spec.ts{,x}'],
    environment: 'jsdom',
    coverage: {
      enabled: true,
      include: ['src/**/*'],
      exclude: ['src/types.ts'],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
    },
  },
});
