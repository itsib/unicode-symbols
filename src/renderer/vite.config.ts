import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig } from 'vite';
import { join } from 'path';
import { pluginAttachToAssets, pluginExposeRenderer } from '../../vite.base.config';

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'renderer'>;
  const { root, mode, forgeConfigSelf } = forgeEnv;
  const name = forgeConfigSelf.name ?? '';

  return {
    root,
    mode,
    base: './',
    build: {
      outDir: `.vite/renderer/${name}`,
      assetsInlineLimit: 0,
      cssCodeSplit: false,
    },
    plugins: [
      pluginExposeRenderer(name),
      pluginAttachToAssets([
        'src/assets/data/names.csv',
        'src/assets/data/blocks.csv',
        'src/assets/data/emoji.csv',
        'src/assets/images',
      ]),
    ],
    resolve: {
      preserveSymlinks: true,
      alias: {
        '/@': join(__dirname, ''),
        '@app-types': join(__dirname, 'types/index.ts'),
        '@app-context': join(__dirname, 'context/index.ts'),
      }
    },
    clearScreen: false,
  } as UserConfig;
});
