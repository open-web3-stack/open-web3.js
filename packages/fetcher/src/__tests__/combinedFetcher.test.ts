jest.mock('../ccxt');
jest.mock('../crypto-compare');

import CombinedFetcher from '../combinedFetcher';
import CCXT from '../ccxt';
import CryptoCompare from '../crypto-compare';
import { Exchange } from '../../interfaces';

describe('Scanner', () => {
  let exchanges: Exchange[] = ['bittrex', 'coinbase', 'kraken'];
  let fetchers = [new CCXT(), new CryptoCompare('123')];
  const fetcher = new CombinedFetcher(exchanges, fetchers);

  it('getPrice', async () => {
    const eth_price = await fetcher.getPrice('ETH/USD');
    expect(eth_price).toEqual('150.53');

    const btc_price = await fetcher.getPrice('BTC/USD');
    expect(btc_price).toEqual('7310.82');

    expect(fetcher.getPrice('BTC/ETH')).rejects.toMatch('not enough prices');
  });
});
