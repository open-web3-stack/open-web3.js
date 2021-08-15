import bn from 'big.js';
import { PriceFetcher } from './types';
import logger from './logger';

const median = (pricesUnsorted: string[], pair: string): string => {
  const prices = pricesUnsorted.sort();
  const mid = Math.ceil(prices.length / 2);
  const medianPrice =
    prices.length % 2 === 0
      ? bn(prices[mid])
          .add(bn(prices[mid - 1]))
          .div(2)
          .toString()
      : prices[mid - 1];
  logger.debug(`find median ${pair}`, { prices, medianPrice });
  return medianPrice;
};

export class CombinedFetcherError extends Error {
  public errors: Error[];
  constructor(message: string, errors: Error[]) {
    super(message);
    this.name = 'CombinedFetcherError';
    this.errors = errors;
  }
}

export type CombinedFetcherConfig = {
  minValidPriceSources?: number;
  weights?: Record<string, number>;
};

/**
 * CombinedFetcher will fetch prices from provided fetchers and find a median.
 *
 * @export
 * @class CombinedFetcher
 * @implements {PriceFetcher}
 */
export default class CombinedFetcher implements PriceFetcher {
  public readonly source: string;
  /**
   * Creates an instance of CombinedFetcher.
   * @param {PriceFetcher[]} fetchers
   * @param {number} minValidPriceSources number of min valid price sources to provide a median
   * @memberof CombinedFetcher
   */
  constructor(private readonly fetchers: PriceFetcher[], private readonly config?: CombinedFetcherConfig) {
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
            const weight = this.config?.weights?.[fetcher.source] || 1;
            logger.debug(`${fetcher.source} ${pair}`, { price, weight });
            return Array(weight).fill(price);
          })
          .catch((error) => error)
      )
    );

    const validResults = results.filter((i) => !(i instanceof Error));

    // ensure enough price sources
    const minValidPriceSources = this.config?.minValidPriceSources || this.fetchers.length;
    if (validResults.length < minValidPriceSources) {
      const errors = results.filter((i) => i instanceof Error);
      throw new CombinedFetcherError('not enough prices', errors);
    }

    // get prices
    const prices = validResults.flat().filter((i) => typeof i === 'string') as string[];

    // return median
    return median(prices, pair);
  }
}
