// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import type { AccountId, Balance, BlockNumber, FixedU128 } from '@open-web3/orml-types/interfaces/runtime';
import type { Enum, Option, Struct, u32 } from '@polkadot/types-codec';
import type { ITuple } from '@polkadot/types-codec/types';

/** @name AuctionInfo */
export interface AuctionInfo extends Struct {
  readonly bid: Option<ITuple<[AccountId, Balance]>>;
  readonly start: BlockNumber;
  readonly end: Option<BlockNumber>;
}

/** @name DelayedDispatchTime */
export interface DelayedDispatchTime extends Enum {
  readonly isAt: boolean;
  readonly asAt: BlockNumber;
  readonly isAfter: boolean;
  readonly asAfter: BlockNumber;
  readonly type: 'At' | 'After';
}

/** @name DispatchId */
export interface DispatchId extends u32 {}

/** @name Price */
export interface Price extends FixedU128 {}

export type PHANTOM_TRAITS = 'traits';
