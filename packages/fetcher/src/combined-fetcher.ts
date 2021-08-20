import assert from 'assert';
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

type FetcherConfig = { fetcher: PriceFetcher; symbolOverrides?: { [symbol: string]: string } };

export type CombinedFetcherConfig = {
  minValidPriceSources?: number;
  fetchers: (PriceFetcher | FetcherConfig)[];
};

/**
 * CombinedFetcher will fetch prices from provided fetchers and find a median.
 *
 * @export
 * @class CombinedFetcher
 * @implements {PriceFetcher}
 */
export default class CombinedFetcher implements PriceFetcher {
  public weight = 1;
  public readonly source: string;
  private readonly fetchers: FetcherConfig[];

  /**
   * Creates an instance of CombinedFetcher.
   * @param fetchers
   * @param minValidPriceSources number of min valid price sources to provide a median
   */
  constructor(private readonly config: CombinedFetcherConfig) {
    this.fetchers = config.fetchers.map(
      (fetcher) => ((fetcher as FetcherConfig).fetcher ? fetcher : { fetcher }) as FetcherConfig
    );
    this.source = this.fetchers.map((x) => x.fetcher.source).join(',');
  }

  /**
   * Get a median from prices provided by fetchers
   *
   * @param pair Pair symbol
   * @returns {Promise<string>}
   */
  async getPrice(pair: string): Promise<string> {
    // fetch from all sources
    const results = await Promise.all(
      this.fetchers.map((fetcher) =>
        fetcher.fetcher
          .getPrice(fetcher.symbolOverrides?.[pair] || pair)
          .then((price) => {
            const { source, weight } = fetcher.fetcher;
            assert(Number.isInteger(weight), `${source} weight should be integer`);
            logger.debug(`${fetcher.fetcher.constructor.name}:${source} ${pair}`, { price, weight });
            return Array(weight).fill(price);
          })
          .catch((error) => {
            logger.debug(`Error: ${fetcher.fetcher.constructor.name}:${fetcher.fetcher.source} ${pair}`, error);
            return error;
          })
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
