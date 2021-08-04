jest.mock('../ccxt-fetcher');
jest.mock('../crypto-compare-fetcher');

import CombinedFetcher from '../combined-fetcher';
import CCXTFetcher from '../ccxt-fetcher';
import CryptoCompareFetcher from '../crypto-compare-fetcher';

describe('CombinedFetcher', () => {
  let fetchers = [];

  ['bittrex', 'coinbase', 'kraken'].forEach((source) => {
    fetchers.push(new CCXTFetcher(source));
    fetchers.push(new CryptoCompareFetcher(source, '123'));
  });

  const fetcher = new CombinedFetcher(fetchers);

  it('getPrice', async () => {
    const eth_price = await fetcher.getPrice('ETH/USD');
    expect(eth_price).toEqual('150.53');

    const btc_price = await fetcher.getPrice('BTC/USD');
    expect(btc_price).toEqual('7310.82');

    await expect(fetcher.getPrice('EUR/USD')).rejects.toThrowError('not enough prices');
  });
});
