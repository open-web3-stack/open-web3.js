export type Pair = 'BTC/USD' | 'ETH/USD' | 'EUR/USD' | 'USD/JPY' | 'APPL/USD' | 'XAU/USD';

export interface FetcherInterface {
  getPrice(pair: Pair): Promise<string>;
}
