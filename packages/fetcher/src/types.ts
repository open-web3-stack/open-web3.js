export interface FetcherInterface {
  readonly source: string;
  getPrice(pair: string): Promise<string>;
}
