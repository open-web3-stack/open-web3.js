// import { detectPackage } from '@polkadot/util';

export { InterfaceRegistry } from './interfaceRegistry';

// TODO: `detectPackage` is unusable due to https://github.com/polkadot-js/common/issues/516
// Restore this after above issue is resolved

// let dirname = 'node_modules';
// let pkgJson;

// try {
//   dirname = __dirname;
// } catch (error) {
//   // ignore
// }

// try {
//   pkgJson = require('./package.json');
// } catch (error) {
//   pkgJson = require('../package.json');
// }

// detectPackage(dirname, pkgJson);
