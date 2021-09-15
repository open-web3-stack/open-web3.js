export default {
  rpc: {},
  types: {
    OrmlCurrencyId: 'u8',
    PoolInfo: {
      totalShares: 'Share',
      rewards: 'BTreeMap<OrmlCurrencyId, (Balance, Balance)>'
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
