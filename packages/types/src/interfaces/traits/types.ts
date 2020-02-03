// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable @typescript-eslint/no-empty-interface */

import { ITuple } from '@polkadot/types/types';
import { Option, Struct } from '@polkadot/types/codec';
import { AccountId, Balance, BlockNumber } from '@orml/types/interfaces/runtime';

/** @name AuctionInfo */
export interface AuctionInfo extends Struct {
  readonly bid: Option<ITuple<[AccountId, Balance]>>;
  readonly start: BlockNumber;
  readonly end: Option<BlockNumber>;
}
