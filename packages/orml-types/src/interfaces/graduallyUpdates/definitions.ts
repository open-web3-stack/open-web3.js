export default {
  types: {
    StorageValue: 'Vec<u8>',
    GraduallyUpdate: {
      key: 'Vec<u8>',
      targetValue: 'StorageValue',
      perBlock: 'StorageValue'
    }
  }
};
