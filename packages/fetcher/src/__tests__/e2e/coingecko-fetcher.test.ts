import CoinGeckoFetcher from '../../coingecko-fetcher';

describe('CoinGeckoFetcher', () => {
  it('getPrice', async () => {
    let fetcher = new CoinGeckoFetcher({
      'btc': 'bitcoin',
      'eth': 'ethereum',
      'dot': 'polkadot',
      'ksm': 'kusama',
      'kar': 'karura'
    });
    const btc_usd = await fetcher.getPrice('BTC/USD');
    console.log('BTC/USD:', btc_usd);

    const eth_usd = await fetcher.getPrice('ETH/usd');
    console.log('ETH/USD:', eth_usd);

    const dot_usd = await fetcher.getPrice('dot/USD');
    console.log('DOT/USD:', dot_usd);

    const ksm_usd = await fetcher.getPrice('ksm/usd');
    console.log('KSM/USD:', ksm_usd);

    const kar_usd = await fetcher.getPrice('kar/usd');
    console.log('KAR/USD:', kar_usd);
  });
});
