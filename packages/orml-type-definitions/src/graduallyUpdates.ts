export default {
  rpc: {},
  types: {
    StorageValue: 'Vec<u8>',
    GraduallyUpdate: {
      key: 'StorageKey',
      targetValue: 'StorageValue',
      perBlock: 'StorageValue'
    },
    StorageKeyBytes: 'Vec<u8>',
    StorageValueBytes: 'Vec<u8>'
  }
};
