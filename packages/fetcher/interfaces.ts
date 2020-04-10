export type Pair = 'BTC/USD' | 'ETH/USD' | 'BTC/ETH';
import ccxt from 'ccxt';

export type Exchange = 'kraken' | 'bittrex' | 'coinbase' | 'binance' | 'bitforex';

export interface FetcherInterface {
  getPrice(exchange: Exchange, pair: Pair): Promise<string>;
}

export interface CombinedFetcherInterface {
  getPrice(pair: Pair): Promise<string>;
}
