export default {
  AssetMetadataDef: {
    currencyId: 'Text',
    url: 'Option<Text>',
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
    argSequence: 'Vec<AssetMetadataArgSequenceNo>',
    section: 'Text',
    method: 'Text',
    path: 'AssetMetadataPath'
  },
  AssetMetadataArgSequenceNo: 'u8',
  AssetMetadataPath: 'Vec<Text>',
  AssetMetadataCalls: {
    transfer: 'AssetMetadataCall'
  },
  AssetMetadataCall: {
    args: 'Vec<AssetArgDef>',
    argSequence: 'Vec<AssetMetadataArgSequenceNo>',
    section: 'Text',
    method: 'Text'
  },
  AssetArgDef: {
    name: 'Text',
    type: 'Text',
    default: 'Option<Text>'
  }
};
