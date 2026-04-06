import type { ForgeConfig } from '@electron-forge/shared-types';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { VitePlugin } from '@electron-forge/plugin-vite';
import pkg from './package.json';
import FusesPlugin from '@electron-forge/plugin-fuses';
import MakerZIP from '@electron-forge/maker-zip';
import type { VitePluginBuildConfig } from '@electron-forge/plugin-vite/src/Config';
import { resolve } from 'node:path';

export const config: ForgeConfig = {
  packagerConfig: {
    name: 'Unicode Symbols',
    executableName: 'unicode-symbols',
    asar: true,
    icon: 'resources/icon',
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      authors: `${pkg.author.name} <${pkg.author.email}>`,
      name: pkg.name,
      title: pkg.productName,
      description: pkg.description,
      setupIcon: 'resources/icon.png'
    }),
    new MakerZIP({}, ['darwin']),
    new MakerDeb({
      options: {
        name: pkg.name,
        icon: resolve(import.meta.dirname, 'resources/icon.png'),
        productName: pkg.productName,
        genericName: pkg.productName,
        maintainer: 'https://github.com/itsib',
        categories: pkg.keywords,
        description: pkg.description,
        productDescription: pkg.productDescription,
      }
    }),
  ],
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: 'src/main/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ] as VitePluginBuildConfig[],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ]
    }),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
      [FuseV1Options.GrantFileProtocolExtraPrivileges]: true,
    })
  ],
  // hooks: {
  //   generateAssets: getGenerateAssetsHook({
  //     logoSvg: path.resolve(__dirname, 'src/assets/logo.svg'),
  //     sizes: [16, 24, 32, 48, 64, 96, 128, 256, 512, 1024],
  //     logosPath: path.resolve(__dirname, 'src/assets/logos'),
  //     assetsPath: path.resolve(__dirname, 'src/assets'),
  //   }),
  // },
};

export default config;
