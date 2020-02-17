module.exports = {
  moduleNameMapper: {
    '@orml/types(.*)$': '<rootDir>/packages/types/src/$1',
    '@orml/api(.*)$': '<rootDir>/packages/api/src/$1',
    '@orml/jsonrpc(.*)$': '<rootDir>/packages/jsonrpc/src/$1',
    '@orml/scanner(.*)$': '<rootDir>/packages/scanner/src/$1',
    '@orml/util(.*)$': '<rootDir>/packages/util/src/$1',
    '@orml/api-derive(.*)$': '<rootDir>/packages/api-derive/src/$1'
  }
};
