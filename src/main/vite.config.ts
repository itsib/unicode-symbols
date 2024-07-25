import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig } from 'vite';
import { vitePluginServerRestart } from '../../forge/vite-plugins/vite-plugin-server-restart';
import { getAppPackageInfo } from '../../forge/utils/get-app-package-info';
import { vitePluginCopyResources } from '../../forge/vite-plugins/vite-plugin-copy-resources';

// https://vitejs.dev/config
export default defineConfig(async (env): Promise<UserConfig> => {
  const forgeEnv = env as ConfigEnv<'build'>;
  const { forgeConfigSelf, command, root, mode, forgeConfig } = forgeEnv;

  const packageInfo = await getAppPackageInfo();

  const define: Record<string, any> = {};
  for (const { name } of forgeConfig.renderer) {
    if (name) {
      const NAME = name.toUpperCase();
      const port = command === 'serve' ? +process.env[`VITE_${NAME}_SERVER_PORT`] : undefined;

      define[`VITE_${NAME}_SERVER_PORT`] = port ? JSON.stringify(port) : undefined;
      define[`VITE_${NAME}_NAME`] = JSON.stringify(name);
    }
  }

  return {
    root,
    mode,
    clearScreen: false,
    define: {
      ...define,
      VITE_APP_VERSION: JSON.stringify(packageInfo.version),
      VITE_INDEXED_DB_NAME: JSON.stringify(packageInfo.idbName),
      VITE_INDEXED_DB_VERSION: JSON.stringify(packageInfo.idbVersion),
    },
    build: {
      lib: {
        entry: forgeConfigSelf.entry!,
        fileName: () => '[name].js',
        formats: ['cjs'],
      },
      emptyOutDir: false,
      outDir: '.vite/build',
      watch: command === 'serve' ? {} : null,
      minify: command === 'build',
      rollupOptions: {
        external: packageInfo.packages,
      },
    },
    plugins: [
      vitePluginServerRestart('restart'),
    ],
    resolve: {
      mainFields: [
        'module',
        'jsnext:main',
        'jsnext',
      ],
    },
  };
});
