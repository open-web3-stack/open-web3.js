const base = require('@open-web3/dev-config/config/eslint.cjs');

module.exports = {
  ...base,
  ignorePatterns: [
    '.eslintrc.js',
    '.github/**',
    '.vscode/**',
    '.yarn/**',
    '**/build/*',
    '**/coverage/*',
    '**/node_modules/*'
  ],
  parserOptions: {
    ...base.parserOptions,
    project: ['./tsconfig.json']
  },
  rules: {
    ...base.rules,
    '@typescript-eslint/indent': 'off', // prettier
    'space-before-function-paren': 'off', // prettier
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    'no-useless-constructor': 'off'
  }
};
