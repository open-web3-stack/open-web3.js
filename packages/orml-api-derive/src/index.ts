import type { DeriveCustom } from '@polkadot/api-base/types';

import { balance } from './currencies';

export const derive: DeriveCustom = {
  currencies: {
    balance: balance as any
  }
};
