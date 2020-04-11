import bn from 'big.js';
import ccxt, { Ticker, Exchange } from 'ccxt';
import { FetcherInterface, Pair } from './types';

/**
 * CCXT fetcher.
 *
 * @export
 * @class CCXT
 * @implements {FetcherInterface}
 */
export default class CCXT implements FetcherInterface {
  private readonly source: string;
  private readonly exchange: Exchange;

  /**
   * Creates an instance of CCXT.
   * @param {string} source
   * @param {{ [key in keyof Exchange]?: Exchange[key] }} [config]
   * @memberof CCXT
   */
  constructor(source: string, config?: { [key in keyof Exchange]?: Exchange[key] }) {
    this.source = source;
    this.exchange = new ccxt[source](config);
  }

  getSymbol(pair: Pair): string | null {
    // TODO: return symbol supported by exchange
    return pair;
  }

  /**
   * Fetch price for a given pair.
   *
   * @param {Pair} pair
   * @returns {Promise<string>} (bid + ask) / 2
   * @memberof CCXT
   */
  getPrice(pair: Pair): Promise<string> {
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
