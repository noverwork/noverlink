import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.js', '**/*.ts', '**/*.tsx', '**/*.jsx'],
    ignores: ['**/*.spec.ts'],
    rules: {
      'sonarjs/class-name': 'off',
    },
  },
];
