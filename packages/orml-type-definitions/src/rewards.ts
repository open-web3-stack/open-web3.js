export default {
  rpc: {},
  types: {
    PoolInfo: {
      totalShares: 'Compact<Share>',
      totalRewards: 'Compact<Balance>',
      totalWithdrawnRewards: 'Compact<Balance>'
    },
    Share: 'u128'
  }
};
