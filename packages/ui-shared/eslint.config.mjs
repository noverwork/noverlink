import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  ...nx.configs['flat/react'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      // Disallow styled-jsx - it's Next.js specific and doesn't work in shared libraries
      'react/no-unknown-property': ['error', { ignore: [] }],
    },
  },
  {
    files: ['**/*.tsx'],
    rules: {
      // Ban <style jsx> usage via custom rule pattern
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXElement[openingElement.name.name="style"][openingElement.attributes.length>0]',
          message: 'styled-jsx (<style jsx>) is not allowed in ui-shared. Use Tailwind CSS or add keyframes to styles.css instead.',
        },
      ],
    },
  },
  {
    ignores: ['**/out-tsc'],
  },
];
