export default {
  rpc: {},
  types: {
    ChainId: {
      _enum: {
        RelayChain: 'Null',
        ParaChain: 'ParaId'
      }
    },
    XCurrencyId: {
      chainId: 'ChainId',
      currencyId: 'Vec<u8>'
    }
  }
};
