import bn from 'big.js';
import ccxt, { Exchange } from 'ccxt';
import { PriceFetcher, TradesFetcher, Trade } from './types';

/**
 * CCXTFetcher.
 *
 * @export
 * @class CCXTFetcher
 * @implements {PriceFetcher}
 */
export default class CCXTFetcher implements PriceFetcher, TradesFetcher {
  public weight = 1;
  private readonly exchange: Exchange;

  /**
   * Creates an instance of CCXTFetcher.
   * @param source Exchange id
   * @param config Config
   */
  constructor(public readonly source: string, config?: { [key in keyof Exchange]?: Exchange[key] }) {
    this.exchange = new ccxt[source]({ timeout: 10_000, ...config });
  }

  /**
   * Fetch price for a given pair.
   * @param pair Pair symbol
   * @returns {Promise<string>} (bid + ask) / 2
   */
  async getPrice(pair: string): Promise<string> {
    const ticker = await this.exchange.fetchTicker(pair);
    // bid & ask avg
    const price = bn(ticker.bid).add(bn(ticker.ask)).div(2);
    return price.toString();
  }

  get hasFetchTrades(): boolean {
    return this.exchange.hasFetchTrades;
  }

  fetchTrades(symbol: string, since: number): Promise<Trade[]> {
    return this.exchange.fetchTrades(symbol, since);
  }
}
