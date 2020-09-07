// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import { Struct, Vec } from '@polkadot/types/codec';
import { u8 } from '@polkadot/types/primitive';
import { AccountId, Moment, OracleValue } from '@open-web3/orml-types/interfaces/runtime';

/** @name DataProviderId */
export interface DataProviderId extends u8 {}

/** @name OrderedSet */
export interface OrderedSet extends Vec<AccountId> {}

/** @name TimestampedValue */
export interface TimestampedValue extends Struct {
  readonly value: OracleValue;
  readonly timestamp: Moment;
}

/** @name TimestampedValueOf */
export interface TimestampedValueOf extends TimestampedValue {}

export type PHANTOM_ORACLE = 'oracle';
