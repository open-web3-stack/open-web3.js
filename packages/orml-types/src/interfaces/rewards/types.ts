// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import { Compact, Struct } from '@polkadot/types/codec';
import { u128 } from '@polkadot/types/primitive';
import { Balance } from '@open-web3/orml-types/interfaces/runtime';

/** @name PoolInfo */
export interface PoolInfo extends Struct {
  readonly totalShares: Compact<Share>;
  readonly totalRewards: Compact<Balance>;
  readonly totalWithdrawnRewards: Compact<Balance>;
}

/** @name Share */
export interface Share extends u128 {}

export type PHANTOM_REWARDS = 'rewards';
