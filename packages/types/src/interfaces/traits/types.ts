// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import { ITuple } from '@polkadot/types/types';
import { Option, Struct } from '@polkadot/types/codec';
import { AccountId, Balance, BlockNumber } from '@open-web3/types/interfaces/runtime';

/** @name AuctionInfo */
export interface AuctionInfo extends Struct {
  readonly bid: Option<ITuple<[AccountId, Balance]>>;
  readonly start: BlockNumber;
  readonly end: Option<BlockNumber>;
}

export type PHANTOM_TRAITS = 'traits';
