export default {
  types: {
    AuctionInfo: {
      bid: 'Option<(AccountId, Balance)>',
      start: 'BlockNumber',
      end: 'Option<BlockNumber>'
    }
  }
};
