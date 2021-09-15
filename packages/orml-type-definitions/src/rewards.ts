export default {
  rpc: {},
  types: {
    CurrencyId: 'u8',
    PoolInfo: {
      totalShares: 'Share',
      rewards: 'BTreeMap<CurrencyId, (Balance, Balance)>'
    },
    CompactBalance: 'Compact<Balance>',
    PoolInfoV0: {
      totalShares: 'Compact<Share>',
      totalRewards: 'CompactBalance',
      totalWithdrawnRewards: 'CompactBalance'
    },
    Share: 'u128'
  }
};
