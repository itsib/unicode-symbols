import { defineConfig } from 'vite';
import pkg from './package.json';

// https://vitejs.dev/config
export default defineConfig({
  define: {
    VITE_APP_VERSION: JSON.stringify(pkg.version),
    VITE_INDEXED_DB_NAME: JSON.stringify(pkg.config.idbName),
    VITE_INDEXED_DB_VERSION: JSON.stringify(pkg.config.idbVersion),
  }
});
