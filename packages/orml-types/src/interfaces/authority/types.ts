// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import { Enum } from '@polkadot/types/codec';
import { u32 } from '@polkadot/types/primitive';
import { BlockNumber, Call } from '@open-web3/orml-types/interfaces/runtime';

/** @name CallOf */
export interface CallOf extends Call {}

/** @name DispatchTime */
export interface DispatchTime extends Enum {
  readonly isAt: boolean;
  readonly asAt: BlockNumber;
  readonly isAfter: boolean;
  readonly asAfter: BlockNumber;
}

/** @name ScheduleTaskIndex */
export interface ScheduleTaskIndex extends u32 {}

export type PHANTOM_AUTHORITY = 'authority';
