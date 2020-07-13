// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import { Struct } from '@polkadot/types/codec';
import { Bytes } from '@polkadot/types/primitive';

/** @name GraduallyUpdate */
export interface GraduallyUpdate extends Struct {
  readonly key: Bytes;
  readonly targetValue: StorageValue;
  readonly perBlock: StorageValue;
}

/** @name StorageValue */
export interface StorageValue extends Bytes {}

export type PHANTOM_GRADUALLYUPDATES = 'graduallyUpdates';
