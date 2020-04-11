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
  private readonly source: string;
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

  getSymbol(pair: string): string | null {
    // TODO: return symbol supported by exchange
    return pair;
  }

  /**
   * Fetch price for a given pair.
   *
   * @param {string} pair
   * @returns {Promise<string>} (bid + ask) / 2
   * @memberof CCXTFetcher
   */
  getPrice(pair: string): Promise<string> {
    const symbol = this.getSymbol(pair);
    if (symbol === null) {
      throw Error('pair not supported');
    }

    return this.exchange.fetchTicker(symbol).then((ticker: Ticker) => {
      // bid & ask avg
      const price = bn(ticker.bid).add(bn(ticker.ask)).div(2);
      return price.toString();
    });
  }
}
