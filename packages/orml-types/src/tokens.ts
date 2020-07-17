export default {
  types: {
    OrmlAccountData: {
      free: 'Balance',
      frozen: 'Balance',
      reserved: 'Balance'
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
