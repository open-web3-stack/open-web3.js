import { Source, Pair, FetcherInterface } from '../../interfaces';

const prices: { [key in Source]?: { [key in Pair]?: string } } = {
  bittrex: {
    'ETH/USD': '149.85',
    'BTC/USD': '7303.36'
  },
  coinbase: {
    'ETH/USD': '151.02',
    'BTC/USD': '7318.28'
  },
  kraken: {
    'ETH/USD': '150.53'
  }
};

export default class Fetcher implements FetcherInterface {
  private readonly exchange: any;

  constructor(source: Source) {
    this.exchange = prices[source];
  }

  getPrice(pair: Pair): Promise<string> {
    const price = this.exchange[pair];
    if (!price) return Promise.reject(Error('failed'));

    return Promise.resolve(price);
  }
}
