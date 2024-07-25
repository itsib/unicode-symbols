import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig } from 'vite';
import { join } from 'path';
import { vitePluginExposeDevServer } from '../../forge/vite-plugins/vite-plugin-expose-dev-server';
import { vitePluginCopyResources } from '../../forge/vite-plugins/vite-plugin-copy-resources';

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
            '@app-lottie': ['lottie-web/build/player/lottie_light'],
          },
        }
      },
    },
    plugins: [
      vitePluginExposeDevServer(name),
      vitePluginCopyResources([
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
