// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import { ITuple } from '@polkadot/types/types';
import { Enum, Option, Struct } from '@polkadot/types/codec';
import { u32 } from '@polkadot/types/primitive';
import { AccountId, Balance, BlockNumber, FixedU128 } from '@open-web3/orml-types/interfaces/runtime';

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
}

/** @name DispatchId */
export interface DispatchId extends u32 {}

/** @name Price */
export interface Price extends FixedU128 {}

export type PHANTOM_TRAITS = 'traits';
