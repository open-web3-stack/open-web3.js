// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import type { Bytes, StorageKey, Struct } from '@polkadot/types';

/** @name GraduallyUpdate */
export interface GraduallyUpdate extends Struct {
  readonly key: StorageKey;
  readonly targetValue: StorageValue;
  readonly perBlock: StorageValue;
}

/** @name StorageKeyBytes */
export interface StorageKeyBytes extends Bytes {}

/** @name StorageValue */
export interface StorageValue extends Bytes {}

/** @name StorageValueBytes */
export interface StorageValueBytes extends Bytes {}

export type PHANTOM_GRADUALLYUPDATES = 'graduallyUpdates';
