import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig } from 'vite';
import { join } from 'path';
import { pluginExposeRenderer } from '../../vite.base.config';

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
      outDir: `dist/renderer/${name}`,
      assetsInlineLimit: 0,
      cssCodeSplit: false,
    },
    plugins: [
      pluginExposeRenderer(name),
    ],
    resolve: {
      preserveSymlinks: true,
      alias: {
        '/@': join(__dirname, 'src/renderer')
      }
    },
    clearScreen: false,
  } as UserConfig;
});
