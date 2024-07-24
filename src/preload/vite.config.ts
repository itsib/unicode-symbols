import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig } from 'vite';
import { vitePluginServerRestart } from '../../forge/vite-plugins/vite-plugin-server-restart';
import { getAppPackageInfo } from '../../forge/utils/get-app-package-info';

// https://vitejs.dev/config
export default defineConfig(async (env): Promise<UserConfig> => {
  const forgeEnv = env as ConfigEnv<'build'>;
  const { forgeConfigSelf, root, mode, command } = forgeEnv;

  const packageInfo = await getAppPackageInfo();

  return {
    root,
    mode,
    clearScreen: false,
    define: {
      VITE_APP_VERSION: JSON.stringify(packageInfo.version),
      VITE_INDEXED_DB_NAME: JSON.stringify(packageInfo.idbName),
      VITE_INDEXED_DB_VERSION: JSON.stringify(packageInfo.idbVersion),
    },
    build: {
      emptyOutDir: false,
      outDir: '.vite/build',
      watch: command === 'serve' ? {} : null,
      minify: command === 'build',
      rollupOptions: {
        external: packageInfo.packages,
        // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
        input: forgeConfigSelf.entry!,
        output: {
          format: 'cjs',
          // It should not be split chunks.
          inlineDynamicImports: true,
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
        },
      },
    },
    plugins: [vitePluginServerRestart('reload')],
  };
});
