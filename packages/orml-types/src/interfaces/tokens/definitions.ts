import { Definitions } from '@polkadot/types/types';

export default {
  rpc: {},
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
  }
} as Definitions;
