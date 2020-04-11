export type Pair = 'BTC/USD' | 'ETH/USD' | 'BTC/ETH';

export interface FetcherInterface {
  getPrice(pair: Pair): Promise<string>;
}
