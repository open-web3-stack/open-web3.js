import ccxt, { Ticker, Exchange as CCXTExchange } from 'ccxt';
import { FetcherInterface, Exchange, Pair } from '../interfaces';
import bn from 'big.js';

export default class CCXT implements FetcherInterface {
  private ccxtExchanges: { [key in Exchange]?: CCXTExchange } = {};

  private getExchange(exchange: Exchange): CCXTExchange | undefined {
    if (!this.ccxtExchanges[exchange]) {
      const Exchange = ccxt[exchange];
      if (!Exchange) return;
      this.ccxtExchanges[exchange] = new Exchange();
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
