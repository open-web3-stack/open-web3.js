import bn from 'big.js';
import { FetcherInterface } from './types';

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

export type CombinedFetcherOptions = {
  minValidPriceSources: number;
  weights?: Record<string, number>;
};

/**
 * CombinedFetcher will fetch prices from provided fetchers and find a median.
 *
 * @export
 * @class CombinedFetcher
 * @implements {FetcherInterface}
 */
export default class CombinedFetcher implements FetcherInterface {
  public readonly source: string;
  /**
   * Creates an instance of CombinedFetcher.
   * @param {FetcherInterface[]} fetchers
   * @param {number} [minValidPrices=3] number of min valid prices to provide a median
   * @memberof CombinedFetcher
   */
  constructor(
    private readonly fetchers: FetcherInterface[],
    private readonly options: CombinedFetcherOptions = { minValidPriceSources: 3 }
  ) {
    this.source = fetchers.map((x) => x.source).join(',');
  }

  /**
   * Get a median from prices provided by fetchers
   *
   * @param {string} pair
   * @returns {Promise<string>}
   * @memberof CombinedFetcher
   */
  async getPrice(pair: string): Promise<string> {
    // fetch from all sources
    const results = await Promise.all(
      this.fetchers.map((fetcher) =>
        fetcher
          .getPrice(pair)
          .then((price) => {
            const weight = this.options.weights?.[fetcher.source] || 1;
            return Array(weight).fill(price);
          })
          .catch((error) => error)
      )
    );

    const validResults = results.filter((i) => !(i instanceof Error));

    // ensure enough price sources
    if (validResults.length < this.options.minValidPriceSources) {
      const errors = results.filter((i) => i instanceof Error);
      throw new CombinedFetcherError('not enough prices', errors);
    }

    // get prices
    const prices = validResults.flat().filter((i) => typeof i === 'string') as string[];

    // return median
    return median(prices);
  }
}
