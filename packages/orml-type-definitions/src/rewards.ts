export default {
  rpc: {},
  types: {
    CompactBalance: 'Compact<Balance>',
    PoolInfo: {
      totalShares: 'Compact<Share>',
      rewards: 'BTreeMap<CompactBalance, CompactBalance>'
    },
    PoolInfoV0: {
      totalShares: 'Compact<Share>',
      totalRewards: 'CompactBalance',
      totalWithdrawnRewards: 'CompactBalance'
    },
    Share: 'u128'
  }
};
