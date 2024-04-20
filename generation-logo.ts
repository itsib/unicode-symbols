import { defineConfig, minimal2023Preset, AssetType, ResolvedAssetSize } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: {
    transparent: {
      sizes: [16, 24, 32, 48, 64, 96, 128, 256, 512, 768, 1024],
      padding: 0,
      resizeOptions: {
        background: 'transparent',
      },
    },
    maskable: {
      sizes: [],
    },
    apple: {
      sizes: [],
    },
    assetName(type: AssetType, size: ResolvedAssetSize) {
      switch (type) {
        case 'transparent':
          return `logos/${size.width}x${size.height}.png`;
      }
    }
  },
  images: ['assets/logo.svg'],
})