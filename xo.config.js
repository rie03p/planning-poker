/** @type {import('xo').Options} */
export default {
  space: 2,

  rules: {
    'react/react-in-jsx-scope': 'off',
    'capitalized-comments': 'off',
    'import-x/extensions': 'off',
    'n/file-extension-in-import': 'off',
    'new-cap': 'off',
    'unicorn/filename-case': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
  },

  ignores: [
    'node_modules',
    '.next',
    'out',
    'public',
  ],
};
