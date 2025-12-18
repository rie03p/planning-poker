import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: [],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.{ts,js}',
        '**/types.ts',
        '**/main.tsx',
        '**/vite-env.d.ts',
      ],
    },
  },
});
