export default {
  rpc: {},
  types: {
    OrmlVestingSchedule: {
      start: 'BlockNumber',
      period: 'BlockNumber',
      periodCount: 'u32',
      perPeriod: 'Compact<Balance>'
    },
    VestingScheduleOf: 'OrmlVestingSchedule'
  }
};
