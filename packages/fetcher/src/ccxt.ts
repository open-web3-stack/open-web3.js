import bn from 'big.js';
import ccxt, { Ticker, Exchange } from 'ccxt';
import { FetcherInterface, Pair } from '../interfaces';

/**
 * CCXT fetcher.
 *
 * @export
 * @class CCXT
 * @implements {FetcherInterface}
 */
export default class CCXT implements FetcherInterface {
  private readonly exchange: Exchange;

  /**
   * Creates an instance of CCXT.
   * @param {string} source
   * @param {{ [key in keyof Exchange]?: Exchange[key] }} [config]
   * @memberof CCXT
   */
  constructor(source: string, config?: { [key in keyof Exchange]?: Exchange[key] }) {
    this.exchange = new ccxt[source](config);
  }

  /**
   * Fetch price for a given pair.
   *
   * @param {Pair} pair
   * @returns {Promise<string>} (bid + ask) / 2
   * @memberof CCXT
   */
  getPrice(pair: Pair): Promise<string> {
    return this.exchange.fetchTicker(pair).then((ticker: Ticker) => {
      // bid & ask avg
      const price = bn(ticker.bid).add(bn(ticker.ask)).div(2);
      return price.toString();
    });
  }
}
