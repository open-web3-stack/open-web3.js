export default {
  rpc: {},
  types: {
    PoolInfo: {
      totalShares: 'Share',
      rewards: 'BTreeMap<Balance, Balance>'
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
