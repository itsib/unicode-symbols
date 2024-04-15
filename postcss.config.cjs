import path from 'node:path';

/** @type {import('postcss').Config} */
module.exports = {
  plugins: [
    require('postcss-import-ext-glob'),
    require('postcss-import')({
      root: path.resolve(__dirname, 'renderer'),
      skipDuplicates: true,
    }),
    require('postcss-nesting'),
    require('autoprefixer'),
  ],
};
