import ccxt, { Ticker, Exchange as CCXTExchange } from 'ccxt';
import { FetcherInterface, Exchange, Pair } from '../interfaces';
import bn from 'big.js';

export default class CCXT implements FetcherInterface {
  private readonly apiKey?: string;
  private readonly secret?: string;

  private ccxtExchanges: { [key in Exchange]?: CCXTExchange } = {};

  constructor(apiKey?: string, secret?: string) {
    this.apiKey = apiKey;
    this.secret = secret;
  }

  private getExchange(exchange: Exchange): CCXTExchange | undefined {
    if (!this.ccxtExchanges[exchange]) {
      const Exchange = ccxt[exchange];
      if (!Exchange) return;
      const config = { apiKey: this.apiKey, secret: this.secret };
      this.ccxtExchanges[exchange] = new Exchange(config);
    }
    return this.ccxtExchanges[exchange];
  }

  getPrice(exchange: Exchange, pair: Pair): Promise<string> {
    const ccxtExchange = this.getExchange(exchange);
    if (!ccxtExchange) throw new Error('cannot find exchange');
    return ccxtExchange.fetchTicker(pair).then((ticker: Ticker) => {
      const price = bn(ticker.bid).add(bn(ticker.ask)).div(2);
      return price.toString();
    });
  }
}
