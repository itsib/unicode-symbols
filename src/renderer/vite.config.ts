import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig } from 'vite';
import { join, resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url'
import { vitePluginExposeDevServer } from '../../forge/vite-plugins/vite-plugin-expose-dev-server';
import { vitePluginCopyResources } from '../../forge/vite-plugins/vite-plugin-copy-resources';

const ROOT = resolve(fileURLToPath(new URL(import.meta.url)), '../../..')

// https://vitejs.dev/config
export default defineConfig((env) => {
  const { root, mode, forgeConfigSelf } = env as ConfigEnv<'renderer'>;
  const name = forgeConfigSelf.name ?? '';

  return {
    root,
    mode,
    base: './',
    logLevel: 'info',
    build: {
      outDir: `.vite/renderer/${name}`,
      assetsInlineLimit: 0,
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          manualChunks: {
            '@react': [
              'react',
              'react-dom',
              'react-router-dom',
              'react-window',
            ],
          },
        }
      },
    },
    plugins: [
      vitePluginExposeDevServer(name),
      vitePluginCopyResources([
        'resources/data/names.csv',
        'resources/data/blocks.csv',
        'resources/data/emoji.csv',
        'resources/images',
      ]),
    ],
    resolve: {
      preserveSymlinks: true,
      alias: {
        '/@': join(root, 'src/renderer'),
        '@app-types': join(root, 'src/renderer/types/index.ts'),
        '@app-context': join(root, 'src/renderer/context/index.ts'),
      }
    },
    clearScreen: false,
  } as UserConfig;
});
