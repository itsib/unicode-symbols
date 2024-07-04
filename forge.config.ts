import type { ForgeConfig } from '@electron-forge/shared-types';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import { getGenerateAssetsHook } from './forge';
import path from 'node:path';

const config: ForgeConfig = {
  packagerConfig: {
    name: 'Unicode Symbols',
    executableName: 'unicode-symbols',
    asar: true,
    icon: 'src/assets/logos/96x96',
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          name: 'unicode-symbols',
          icon: 'src/assets/logos/512x512.png',
          categories: ['Graphics', 'Utility'],
          genericName: 'Unicode Symbols',
          description: 'Browse and search for non-standard unicode symbols',
        }
      }
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        build: [
          {
            entry: 'src/main/main.ts',
            config: 'src/main/vite.config.ts',
          },
          {
            entry: 'src/preload/preload.ts',
            config: 'src/preload/vite.config.ts',
          },
        ],
        renderer: [
          {
            name: 'main_window',
            config: 'src/renderer/vite.config.ts',
          },
        ],
      }
    },
    {
      name: '@electron-forge/plugin-fuses',
      config: {
        version: FuseVersion.V1,
        [FuseV1Options.RunAsNode]: false,
        [FuseV1Options.EnableCookieEncryption]: true,
        [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
        [FuseV1Options.EnableNodeCliInspectArguments]: false,
        [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
        [FuseV1Options.OnlyLoadAppFromAsar]: true,
      }
    },
  ],
  hooks: {
    generateAssets: getGenerateAssetsHook({
      logoSvg: path.resolve(__dirname, 'src/assets/logo.svg'),
      assets: path.resolve(__dirname, 'src/assets'),
    }),
  },
};

export default config;
