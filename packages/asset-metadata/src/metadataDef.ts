export default {
  AssetMetadataDef: {
    currencyId: 'Text',
    // types: {},
    description: 'AssetMetadataDescription',
    operations: 'AssetMetadataOperationDescription'
  },
  AssetMetadataDescription: {
    currencyId: 'Text',
    name: 'Text',
    symbol: 'Text',
    decimals: 'u8',
    description: 'Text',
    uri: 'Option<Text>',
    icon: 'Option<Text>'
  },
  AssetMetadataOperationDescription: {
    currencyId: 'Text',
    storage: 'AssetMetadataStorage',
    calls: 'AssetMetadataCalls'
  },
  AssetMetadataStorage: {
    freeBalance: 'AssetMetadataQuery'
  },
  AssetMetadataQuery: {
    args: 'Vec<AssetArgDef>',
    argSequence: 'Vec<u8>',
    section: 'Text',
    method: 'Text',
    path: 'AssetMetadataPath'
  },
  AssetMetadataPath: 'Vec<Text>',
  AssetMetadataCalls: {
    transfer: 'AssetMetadataCall'
  },
  AssetMetadataCall: {
    args: 'Vec<AssetArgDef>',
    argSequence: 'Vec<u8>',
    section: 'Text',
    method: 'Text'
  },
  AssetArgDef: {
    name: 'Text',
    type: 'Text',
    default: 'Option<Text>'
  }
};
