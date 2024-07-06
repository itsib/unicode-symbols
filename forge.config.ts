import type { ForgeConfig } from '@electron-forge/shared-types';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import { MakerDebConfig } from '@electron-forge/maker-deb';
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
      config: <MakerDebConfig> {
        options: {
          name: 'unicode-symbols',
          icon: 'src/assets/logos/512x512.png',
          productName: 'Unicode Symbols',
          genericName: 'Characters',
          maintainer: 'https://github.com/itsib',
          categories: ['Graphics', 'Utility'],
          description: 'Utility application to browse and search unusual characters.',
          productDescription: 'Unicode Symbols is a simple utility application to find and insert unusual characters. ' +
            'It allows you to quickly find the symbol you are looking for by searching for keywords.\n\n' +
            'You can also browse characters by categories, such as Punctuation, Pictures, etc.'
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
        [FuseV1Options.GrantFileProtocolExtraPrivileges]: true,
      }
    },
  ],
  hooks: {
    generateAssets: getGenerateAssetsHook({
      logoSvg: path.resolve(__dirname, 'src/assets/logo.svg'),
      sizes: [16, 24, 32, 48, 64, 96, 128, 256, 512, 1024],
      logosPath: path.resolve(__dirname, 'src/assets/logos'),
      assetsPath: path.resolve(__dirname, 'src/assets'),
    }),
  },
};

export default config;
