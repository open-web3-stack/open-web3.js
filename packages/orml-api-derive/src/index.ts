import { DeriveCustom } from '@polkadot/api-derive';

import * as currencies from './currencies';

export const derive: DeriveCustom = {
  currencies
};
