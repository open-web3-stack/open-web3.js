import bn from 'big.js';
import { CombinedFetcherInterface, FetcherInterface, Exchange, Pair } from '../interfaces';
import CCXT from './ccxt';
import CryptoCompare from './crypto-compare';

const median = (pricesUnsorted: string[]): string => {
  const prices = pricesUnsorted.sort();
  const mid = Math.ceil(prices.length / 2);
  return prices.length % 2 === 0
    ? bn(prices[mid])
        .add(bn(prices[mid - 1]))
        .div(2)
        .toString()
    : prices[mid - 1];
};

export default class CombinedFetcher implements CombinedFetcherInterface {
  private readonly exchanges: Exchange[];
  private readonly minCount: number;
  private readonly fetchers: FetcherInterface[];

  constructor(exchanges: Exchange[], minCount = 3) {
    this.minCount = minCount;
    this.exchanges = exchanges;
    this.fetchers = [new CCXT(), new CryptoCompare('')];
  }

  async getPrice(pair: Pair): Promise<string> {
    const results = await Promise.all(
      this.fetchers
        .map((fetcher) => this.exchanges.map((exchange) => fetcher.getPrice(exchange, pair).catch(() => undefined)))
        .reduce((acc, val) => acc.concat(val), [])
    );
    const prices = results.filter((i) => typeof i === 'string') as string[];
    if (prices.length < this.minCount) {
      throw Error('not enough prices');
    }
    return median(prices);
  }
}
