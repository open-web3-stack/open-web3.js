module.exports = {
  moduleNameMapper: {
    '@orml/types(.*)$': '<rootDir>/packages/types/src/$1',
    // '@orml/api(.*)$': '<rootDir>/packages/api/src/$1',
    '@orml/jsonrpc(.*)$': '<rootDir>/packages/jsonrpc/src/$1',
    '@orml/scanner(.*)$': '<rootDir>/packages/scanner/src/$1',
    '@orml/util(.*)$': '<rootDir>/packages/util/src/$1',
    '@orml/api-derive(.*)$': '<rootDir>/packages/api-derive/src/$1'
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
