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

    // TODO
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/parameter-properties': 'off',
    '@typescript-eslint/switch-exhaustiveness-check': 'off',
    '@typescript-eslint/member-ordering': 'off',
    '@typescript-eslint/triple-slash-reference': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    'no-eq-null': 'off',
    'no-alert': 'off',
    'import-x/no-anonymous-default-export': 'off',
    'unicorn/filename-case': 'off',
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/prefer-add-event-listener': 'off',
    'promise/prefer-await-to-then': 'off',
    'no-warning-comments': 'off',

  },

  ignores: [
    'node_modules',
    '.next',
    'out',
    'public',
  ],
};
