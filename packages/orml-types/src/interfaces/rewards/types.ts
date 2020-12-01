// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import type { Compact, Struct, u128 } from '@polkadot/types';
import type { Balance } from '@open-web3/orml-types/interfaces/runtime';

/** @name PoolInfo */
export interface PoolInfo extends Struct {
  readonly totalShares: Compact<Share>;
  readonly totalRewards: Compact<Balance>;
  readonly totalWithdrawnRewards: Compact<Balance>;
}

/** @name Share */
export interface Share extends u128 {}

export type PHANTOM_REWARDS = 'rewards';
