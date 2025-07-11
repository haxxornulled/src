import { defineConfig } from 'vite';
import babel from 'vite-plugin-babel';

export default defineConfig({
  build: {
    lib: {
      entry: 'FormValidation/Startup/startup-with-config.ts',
      name: 'FormValidation',
      fileName: 'form-validation',
      formats: ['iife'],
    },
    outDir: 'dist/global',
    emptyOutDir: true,
  },
  plugins: [
    babel(),
  ],
}); 