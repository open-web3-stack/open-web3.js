jest.mock('../ccxt-fetcher');
jest.mock('../crypto-compare-fetcher');

import CombinedFetcher from '../combined-fetcher';
import CCXTFetcher from '../ccxt-fetcher';
import CryptoCompareFetcher from '../crypto-compare-fetcher';

describe('CombinedFetcher', () => {
  let fetchers = [];

  const weights = {
    bittrex: 2,
    coinbase: 4,
    kraken: 3,
    CCCAGG: 5
  };

  ['bittrex', 'coinbase', 'kraken'].forEach((source) => {
    const fetcher = new CCXTFetcher(source);
    fetcher.weight = weights[source];
    fetchers.push({ fetcher });
  });
  const cc = new CryptoCompareFetcher('CCCAGG', '');
  cc.weight = weights['CCCAGG'];
  fetchers.push(cc);
  fetchers[0].symbolOverrides = { 'ETH/USD': 'ETH/USDT', 'BTC/USD': 'BTC/USDT' }

  const fetcher = new CombinedFetcher({
    minValidPriceSources: 3,
    fetchers
  });

  it('getPrice', async () => {
    const eth_price = await fetcher.getPrice('ETH/USD');
    expect(eth_price).toEqual('151.02');

    const btc_price = await fetcher.getPrice('BTC/USD');
    expect(btc_price).toEqual('7310.38');

    await expect(fetcher.getPrice('EUR/USD')).rejects.toThrowError('not enough prices');
  });
});
