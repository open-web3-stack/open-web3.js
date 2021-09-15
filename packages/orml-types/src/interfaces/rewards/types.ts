// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import type { BTreeMap, Compact, Struct, u128 } from '@polkadot/types';
import type { Balance } from '@open-web3/orml-types/interfaces/runtime';

/** @name CompactBalance */
export interface CompactBalance extends Compact<Balance> {}

/** @name PoolInfo */
export interface PoolInfo extends Struct {
  readonly totalShares: Share;
  readonly rewards: BTreeMap<Balance, Balance>;
}

/** @name PoolInfoV0 */
export interface PoolInfoV0 extends Struct {
  readonly totalShares: Compact<Share>;
  readonly totalRewards: CompactBalance;
  readonly totalWithdrawnRewards: CompactBalance;
}

/** @name Share */
export interface Share extends u128 {}

export type PHANTOM_REWARDS = 'rewards';
