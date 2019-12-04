// Auto-generated via `yarn build:interfaces`, do not edit
/* eslint-disable @typescript-eslint/no-empty-interface */

import { Struct } from '@polkadot/types/codec';
import { Moment, OracleValue } from '@orml/types/interfaces/runtime';

/** Struct */
export interface TimestampedValue extends Struct {
  /** OracleValue */
  readonly value: OracleValue;
  /** Moment */
  readonly timestamp: Moment;
}

/** TimestampedValue */
export interface TimestampedValueOf extends TimestampedValue {}
