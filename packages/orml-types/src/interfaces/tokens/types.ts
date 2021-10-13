// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import type { Balance, LockIdentifier } from '@open-web3/orml-types/interfaces/runtime';
import type { Struct } from '@polkadot/types';

/** @name OrmlAccountData */
export interface OrmlAccountData extends Struct {
  readonly free: Balance;
  readonly frozen: Balance;
  readonly reserved: Balance;
}

/** @name OrmlBalanceLock */
export interface OrmlBalanceLock extends Struct {
  readonly amount: Balance;
  readonly id: LockIdentifier;
}

export type PHANTOM_TOKENS = 'tokens';
