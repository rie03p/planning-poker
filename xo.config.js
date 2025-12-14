/** @type {import('xo').Options} */
export default {
  space: 2,

  rules: {
    'react/react-in-jsx-scope': 'off',
    'capitalized-comments': 'off',
    'import-x/extensions': 'off',
    'n/file-extension-in-import': 'off',
    'new-cap': 'off',
    '@typescript-eslint/naming-convention': 'off',
  },

  ignores: [
    'node_modules',
    '.next',
    'out',
    'public',
  ],
};
