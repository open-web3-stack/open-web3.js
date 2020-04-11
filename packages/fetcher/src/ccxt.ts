import bn from 'big.js';
import ccxt, { Ticker, Exchange } from 'ccxt';
import { FetcherInterface, Pair } from '../interfaces';

export default class CCXT implements FetcherInterface {
  private readonly exchange: Exchange;

  constructor(source: string, config?: { [key in keyof Exchange]?: Exchange[key] }) {
    this.exchange = new ccxt[source](config);
  }

  getPrice(pair: Pair): Promise<string> {
    return this.exchange.fetchTicker(pair).then((ticker: Ticker) => {
      // bid & ask avg
      const price = bn(ticker.bid).add(bn(ticker.ask)).div(2);
      return price.toString();
    });
  }
}
