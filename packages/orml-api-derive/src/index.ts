import { DeriveCustom } from '@polkadot/api-derive';

import { balance } from './currencies';

export const derive: DeriveCustom = {
  currencies: {
    balance: balance as any
  }
};
