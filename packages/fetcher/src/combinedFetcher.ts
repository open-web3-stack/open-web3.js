import bn from 'big.js';
import { FetcherInterface, Pair } from './types';
import moduleLogger from './logger';

const logger = moduleLogger.createLogger('CombinedFetcher');

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

export class CombinedFetcherError extends Error {
  public errors: Error[];
  constructor(message: string, errors: Error[]) {
    super(message);
    this.name = 'CombinedFetcherError';
    this.errors = errors;
  }
}

/**
 * CombinedFetcher will fetch prices from provided fetchers and find a median.
 *
 * @export
 * @class CombinedFetcher
 * @implements {FetcherInterface}
 */
export default class CombinedFetcher implements FetcherInterface {
  private readonly minValidPrices: number;
  private readonly fetchers: FetcherInterface[];

  /**
   * Creates an instance of CombinedFetcher.
   * @param {FetcherInterface[]} fetchers
   * @param {number} [minValidPrices=3] number of min valid prices to provide a median
   * @memberof CombinedFetcher
   */
  constructor(fetchers: FetcherInterface[], minValidPrices = 3) {
    this.minValidPrices = minValidPrices;
    this.fetchers = fetchers;
  }

  /**
   * Get a median from prices provided by fetchers
   *
   * @param {Pair} pair
   * @returns {Promise<string>}
   * @memberof CombinedFetcher
   */
  async getPrice(pair: Pair): Promise<string> {
    // fetch from all sources
    const results = await Promise.all(
      this.fetchers.map((fetcher) =>
        fetcher.getPrice(pair).catch((error) => {
          logger.warn('getPrice', { pair, error });
          return error;
        })
      )
    );

    // get prices
    const prices = results.filter((i) => typeof i === 'string') as string[];

    // ensure enough prices
    if (prices.length < this.minValidPrices) {
      const errors = results.filter((i) => i instanceof Error);
      throw new CombinedFetcherError('not enough prices', errors);
    }

    // return median
    return median(prices);
  }
}
