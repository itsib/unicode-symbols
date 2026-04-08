import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { vitePluginCopyResources } from './forge/vite-plugins/vite-plugin-copy-resources';

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    preserveSymlinks: true,
    alias: {
      '/@': resolve(import.meta.dirname, 'src/renderer'),
      '@app-types': resolve(import.meta.dirname, 'src/renderer/types/index.ts'),
      '@app-context': resolve(import.meta.dirname, 'src/renderer/context/index.ts'),
    }
  },
  plugins: [
    vitePluginCopyResources([
      'resources/data/unicode.csv',
      'resources/data/blocks.csv',
      'resources/data/emoji.csv',
      'resources/images',
    ]),
  ]
});
