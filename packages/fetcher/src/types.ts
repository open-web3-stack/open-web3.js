export interface FetcherInterface {
  getPrice(pair: string): Promise<string>;
}
