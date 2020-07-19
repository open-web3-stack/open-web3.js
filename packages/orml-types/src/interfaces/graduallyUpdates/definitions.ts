import { Definitions } from '@polkadot/types/types';

export default {
  rpc: {},
  types: {
    StorageValue: 'Vec<u8>',
    GraduallyUpdate: {
      key: 'Vec<u8>',
      targetValue: 'StorageValue',
      perBlock: 'StorageValue'
    }
  }
} as Definitions;
