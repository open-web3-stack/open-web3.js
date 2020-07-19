import { Definitions } from '@polkadot/types/types';

export default {
  rpc: {},
  types: {
    VestingSchedule: {
      start: 'BlockNumber',
      period: 'BlockNumber',
      periodCount: 'u32',
      perPeriod: 'Compact<Balance>'
    },
    VestingScheduleOf: 'VestingSchedule'
  }
} as Definitions;
