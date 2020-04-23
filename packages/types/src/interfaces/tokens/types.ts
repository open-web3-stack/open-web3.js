// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import { Struct } from '@polkadot/types/codec';
import { Balance, LockIdentifier } from '@open-web3/types/interfaces/runtime';

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
