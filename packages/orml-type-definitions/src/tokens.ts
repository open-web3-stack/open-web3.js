export default {
  rpc: {},
  types: {
    OrmlAccountData: {
      free: 'Balance',
      reserved: 'Balance',
      frozen: 'Balance'
    },
    OrmlBalanceLock: {
      amount: 'Balance',
      id: 'LockIdentifier'
    }
  },
  typesAlias: {
    tokens: {
      AccountData: 'OrmlAccountData',
      BalanceLock: 'OrmlBalanceLock'
    }
  }
};
