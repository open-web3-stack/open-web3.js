module.exports = {
  moduleNameMapper: {
    '@open-web3/api(.*)$': '<rootDir>/packages/api/src/$1',
    '@open-web3/app-util(.*)$': '<rootDir>/packages/app-util/src/$1',
    '@open-web3/asset-metadata(.*)$': '<rootDir>/packages/asset-metadata/src/$1',
    '@open-web3/dispatcher(.*)$': '<rootDir>/packages/dispatcher/src/$1',
    '@open-web3/fetcher(.*)$': '<rootDir>/packages/fetcher/src/$1',
    '@open-web3/indexer(.*)$': '<rootDir>/packages/indexer/src/$1',
    '@open-web3/orml-api-derive(.*)$': '<rootDir>/packages/orml-api-derive/src/$1',
    '@open-web3/orml-type-definitions(.*)$': '<rootDir>/packages/orml-type-definitions/src/$1',
    '@open-web3/orml-types(.*)$': '<rootDir>/packages/orml-types/src/$1',
    '@open-web3/scanner(.*)$': '<rootDir>/packages/scanner/src/$1',
    '@open-web3/util(.*)$': '<rootDir>/packages/util/src/$1'
  },
  modulePathIgnorePatterns: [
    '<rootDir>/build',
    '<rootDir>/packages/api/build',
    '<rootDir>/packages/app-util/build',
    '<rootDir>/packages/asset-metadata/build',
    '<rootDir>/packages/dispatcher/build',
    '<rootDir>/packages/fetcher/build',
    '<rootDir>/packages/indexer/build',
    '<rootDir>/packages/orml-api-derive/build',
    '<rootDir>/packages/orml-type-definitions/build',
    '<rootDir>/packages/orml-types/build',
    '<rootDir>/packages/scanner/build',
    '<rootDir>/packages/util/build'
  ],
  transformIgnorePatterns: ['/node_modules/(?!@polkadot|@babel/runtime/helpers/esm/)']
};
