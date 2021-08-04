jest.mock('../ccxt-fetcher');
jest.mock('../crypto-compare-fetcher');

import CombinedFetcher from '../combined-fetcher';
import CCXTFetcher from '../ccxt-fetcher';
import CryptoCompareFetcher from '../crypto-compare-fetcher';

describe('CombinedFetcher', () => {
  let fetchers = [];

  ['bittrex', 'coinbase', 'kraken'].forEach((source) => {
    fetchers.push(new CCXTFetcher(source));
  });
  fetchers.push(new CryptoCompareFetcher('CCCAGG', ''));

  const options = {
    minValidPriceSources: 3,
    weights: {
      bittrex: 2,
      coinbase: 4,
      kraken: 3,
      CCCAGG: 5
    }
  };
  const fetcher = new CombinedFetcher(fetchers, options);

  it('getPrice', async () => {
    const eth_price = await fetcher.getPrice('ETH/USD');
    expect(eth_price).toEqual('151.02');

    const btc_price = await fetcher.getPrice('BTC/USD');
    expect(btc_price).toEqual('7310.38');

    await expect(fetcher.getPrice('EUR/USD')).rejects.toThrowError('not enough prices');
  });
});
