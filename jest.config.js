module.exports = {
  moduleNameMapper: {
    '@open-web3/types(.*)$': '<rootDir>/packages/types/src/$1',
    // '@open-web3/api(.*)$': '<rootDir>/packages/api/src/$1',
    '@open-web3/jsonrpc(.*)$': '<rootDir>/packages/jsonrpc/src/$1',
    '@open-web3/scanner(.*)$': '<rootDir>/packages/scanner/src/$1',
    '@open-web3/util(.*)$': '<rootDir>/packages/util/src/$1',
    '@open-web3/api-derive(.*)$': '<rootDir>/packages/api-derive/src/$1'
  },
  modulePathIgnorePatterns: [
    '<rootDir>/build',
    '<rootDir>/packages/api/build',
    '<rootDir>/packages/util/build',
    '<rootDir>/packages/fetcher/build',
    '<rootDir>/packages/dispatcher/build',
    '<rootDir>/packages/indexer/build',
    '<rootDir>/packages/api-derive/build',
    '<rootDir>/packages/types/build',
    '<rootDir>/packages/scanner/build'
  ]
};
