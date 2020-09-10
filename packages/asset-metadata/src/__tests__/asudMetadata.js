export default {
  currencyId: 'AUSD',
  description: {
    name: 'Acala Dollar',
    symbol: 'aUSD',
    decimals: 18,
    description: 'Acala Dollar description',
    icon: 'https://ipfs.io/ipfs/QmQrSbMLvxHqgzi8E2Qy4r65GD94mbyPHWbTYVrT4gDT2e'
  },
  operations: {
    storage: {
      freeBalance: {
        args: [{ name: 'accountId' }, { name: 'currentId', default: 'AUSD' }],
        argSequence: [0],
        section: 'tokens',
        method: 'accounts',
        path: ['free']
      }
    },
    calls: {
      transfer: {
        args: [{ name: 'dest' }, { name: 'currentId', default: 'AUSD' }, { name: 'amount' }],
        argSequence: [0, 2],
        section: 'currencies',
        method: 'transfer'
      }
    }
  }
};
