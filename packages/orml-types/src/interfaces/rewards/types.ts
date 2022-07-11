// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import type { Balance } from '@open-web3/orml-types/interfaces/runtime';
import type { BTreeMap, Compact, Struct, u128, u8 } from '@polkadot/types-codec';
import type { ITuple } from '@polkadot/types-codec/types';

/** @name CompactBalance */
export interface CompactBalance extends Compact<Balance> {}

/** @name OrmlCurrencyId */
export interface OrmlCurrencyId extends u8 {}

/** @name PoolInfo */
export interface PoolInfo extends Struct {
  readonly totalShares: Share;
  readonly rewards: BTreeMap<OrmlCurrencyId, ITuple<[Balance, Balance]>>;
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
