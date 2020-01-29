const base = require('@polkadot/dev/config/eslint');

module.exports = {
  ...base,
  parserOptions: {
    ...base.parserOptions,
    project: ['./tsconfig.json']
  },
  rules: {
    ...base.rules,
    '@typescript-eslint/indent': 'off', // prettier
    'space-before-function-paren': 'off' // prettier
  }
};
