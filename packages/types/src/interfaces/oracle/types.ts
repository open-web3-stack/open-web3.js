// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable @typescript-eslint/no-empty-interface */

import { Struct } from '@polkadot/types/codec';
import { Moment, OracleValue } from '@orml/types/interfaces/runtime';

/** @name TimestampedValue */
export interface TimestampedValue extends Struct {
  readonly value: OracleValue;
  readonly timestamp: Moment;
}

/** @name TimestampedValueOf */
export interface TimestampedValueOf extends TimestampedValue {}
