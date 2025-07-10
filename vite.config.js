import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: './dist',
    rollupOptions: {
      input: {
        'form-validation': resolve(__dirname, './FormValidation/Startup/startup.ts'),
      },
      output: {
        format: 'esm',
        entryFileNames: 'form-validation.js', // <-- Force filename
        chunkFileNames: 'js/chunks/[name]-[hash].js',
        assetFileNames: ({ name }) => {
          if (name && name.endsWith('.css')) {
            return 'css/[name][extname]';
          }
          return 'assets/[name][extname]';
        },
      }
    },
    target: 'esnext',
    sourcemap: true,
    minify: 'esbuild',
    emptyOutDir: true,
  }
});
