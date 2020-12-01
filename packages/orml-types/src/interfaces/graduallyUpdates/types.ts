// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import type { Bytes, StorageKey, Struct } from '@polkadot/types';

/** @name GraduallyUpdate */
export interface GraduallyUpdate extends Struct {
  readonly key: StorageKey;
  readonly targetValue: StorageValue;
  readonly perBlock: StorageValue;
}

/** @name StorageValue */
export interface StorageValue extends Bytes {}

export type PHANTOM_GRADUALLYUPDATES = 'graduallyUpdates';
