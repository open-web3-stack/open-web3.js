export type Pair = 'BTC/USD' | 'ETH/USD' | 'BTC/ETH';

export type Source = 'kraken' | 'bittrex' | 'coinbase' | 'binance' | 'bitforex';

export interface FetcherInterface {
  getPrice(pair: Pair): Promise<string>;
}
