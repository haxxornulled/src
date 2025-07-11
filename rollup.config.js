import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'FormValidation/Startup/startup-with-config.ts',
  output: {
    file: 'dist/global/form-validation.iife.js',
    format: 'iife',
    name: 'FormValidation',
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: true,
    }),
  ],
}; 