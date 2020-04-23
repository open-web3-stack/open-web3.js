module.exports = {
  moduleNameMapper: {
    '@open-web3/orml-types(.*)$': '<rootDir>/packages/orml-types/src/$1',
    '@open-web3/jsonrpc(.*)$': '<rootDir>/packages/jsonrpc/src/$1',
    '@open-web3/scanner(.*)$': '<rootDir>/packages/scanner/src/$1',
    '@open-web3/util(.*)$': '<rootDir>/packages/util/src/$1',
    '@open-web3/orml-api-derive(.*)$': '<rootDir>/packages/orml-api-derive/src/$1'
  },
  modulePathIgnorePatterns: [
    '<rootDir>/build',
    '<rootDir>/packages/api/build',
    '<rootDir>/packages/util/build',
    '<rootDir>/packages/fetcher/build',
    '<rootDir>/packages/dispatcher/build',
    '<rootDir>/packages/indexer/build',
    '<rootDir>/packages/orml-api-derive/build',
    '<rootDir>/packages/orml-types/build',
    '<rootDir>/packages/scanner/build'
  ]
};
