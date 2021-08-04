import bn from 'big.js';
import ccxt, { Ticker, Exchange } from 'ccxt';
import { FetcherInterface } from './types';

/**
 * CCXTFetcher.
 *
 * @export
 * @class CCXTFetcher
 * @implements {FetcherInterface}
 */
export default class CCXTFetcher implements FetcherInterface {
  public readonly source: string;
  private readonly exchange: Exchange;

  /**
   * Creates an instance of CCXTFetcher.
   * @param {string} source
   * @param {{ [key in keyof Exchange]?: Exchange[key] }} [config]
   * @memberof CCXTFetcher
   */
  constructor(source: string, config?: { [key in keyof Exchange]?: Exchange[key] }) {
    this.source = source;
    this.exchange = new ccxt[source]({ timeout: 2000, ...config });
  }

  /**
   * Fetch price for a given pair.
   *
   * @param {string} pair
   * @returns {Promise<string>} vwap price
   * @memberof CCXTFetcher
   */
  getPrice(pair: string): Promise<string> {
    return this.exchange.fetchTicker(pair).then((ticker: Ticker) => {
      if (ticker.vwap) {
        return ticker.vwap.toString();
      }
      throw Error('VWAP price undefined');
    });
  }
}
