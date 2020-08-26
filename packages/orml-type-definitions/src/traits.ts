export default {
  rpc: {},
  types: {
    AuctionInfo: {
      bid: 'Option<(AccountId, Balance)>',
      start: 'BlockNumber',
      end: 'Option<BlockNumber>'
    },
    DelayedDispatchTime: {
      _enum: {
        At: 'BlockNumber',
        After: 'BlockNumber'
      }
    },
    DispatchId: 'u32',
    Price: 'FixedU128'
  }
};
