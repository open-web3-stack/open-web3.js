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
    ScheduleTaskIndex: 'u32',
    DelayedOrigin: {
      delay: 'BlockNumber',
      origin: 'PalletsOrigin'
    },
    AuthorityOrigin: 'DelayedOrigin'
  }
};
