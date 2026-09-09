import {defineConfig} from 'vite';
import react, {reactCompilerPreset} from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({presets: [reactCompilerPreset()]})],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    // Preserve Vite 7's browser targets when upgrading to Vite 8.
    target: ['chrome107', 'edge107', 'firefox104', 'safari16'],
  },
});
