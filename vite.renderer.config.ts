import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig } from 'vite';
import { pluginExposeRenderer } from './vite.base.config';
import { join } from 'path';
import svg from 'vite-plugin-svgr';

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'renderer'>;
  const { root, mode, forgeConfigSelf } = forgeEnv;
  const name = forgeConfigSelf.name ?? '';

  return {
    root,
    mode,
    base: './',
    // html: {
    //   cspNonce: '2726c7f26c'
    // },
    build: {
      outDir: `.vite/renderer/${name}`,
      assetsInlineLimit: 0,
      cssCodeSplit: false,
    },
    plugins: [
      svg(),
      pluginExposeRenderer(name)
    ],
    resolve: {
      preserveSymlinks: true,
      alias: {
        '/@': join(__dirname, 'renderer')
      }
    },
    clearScreen: false,
  } as UserConfig;
});
