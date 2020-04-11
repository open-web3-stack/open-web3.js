jest.mock('../ccxt');
jest.mock('../crypto-compare');

import CombinedFetcher from '../combinedFetcher';
import CCXT from '../ccxt';
import CryptoCompare from '../crypto-compare';

describe('CombinedFetcher', () => {
  let fetchers = [];

  ['bittrex', 'coinbase', 'kraken'].forEach((source) => {
    fetchers.push(new CCXT(source));
    fetchers.push(new CryptoCompare(source, '123'));
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
