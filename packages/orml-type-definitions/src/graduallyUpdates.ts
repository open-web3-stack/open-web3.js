export default {
  rpc: {},
  types: {
    StorageValue: 'Vec<u8>',
    GraduallyUpdate: {
      key: 'StorageKey',
      targetValue: 'StorageValue',
      perBlock: 'StorageValue'
    }
  }
};
