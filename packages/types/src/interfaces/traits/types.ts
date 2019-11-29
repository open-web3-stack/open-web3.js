// Auto-generated via `yarn build:interfaces`, do not edit
/* eslint-disable @typescript-eslint/no-empty-interface */

import { ITuple } from '@polkadot/types/types';
import { Option, Struct } from '@polkadot/types/codec';
import { AccountId, Balance, BlockNumber } from '@orml/types/interfaces/runtime';

/** Struct */
export interface AuctionInfo extends Struct {
  /** Option<ITuple<[AccountId, Balance]>> */
  readonly bid: Option<ITuple<[AccountId, Balance]>>;
  /** BlockNumber */
  readonly start: BlockNumber;
  /** Option<BlockNumber> */
  readonly end: Option<BlockNumber>;
}
