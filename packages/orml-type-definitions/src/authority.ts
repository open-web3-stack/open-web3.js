export default {
  rpc: {},
  types: {
    CallOf: 'Call',
    DispatchTime: {
      _enum: {
        At: 'BlockNumber',
        After: 'BlockNumber'
      }
    },
    AsOriginId: {
      _enum: ['Root', 'AcalaTreasury', 'HonzonTreasury', 'HomaTreasury', 'DSWF']
    },
    ScheduleTaskIndex: 'u32'
  }
};
