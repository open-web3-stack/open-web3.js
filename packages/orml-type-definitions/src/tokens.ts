export default {
  rpc: {
    queryExistentialDeposit: {
      description: 'Query Existential Deposit for a given currency.',
      params: [
        {
          name: 'currencyId',
          type: 'CurrencyId'
        },
        {
          name: 'at',
          type: 'BlockHash',
          isHistoric: true,
          isOptional: true
        }
      ],
      type: 'NumberOrHex'
    }
  },
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
