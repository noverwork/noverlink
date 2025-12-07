const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/migrator'),
  },
  watchOptions: {
    ignored: ['**/src/migrations'],
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),

    new CopyPlugin({
      patterns: [
        {
          from: '.env*',
          to: '[name][ext]',
        },
      ],
    }),
  ],
};
