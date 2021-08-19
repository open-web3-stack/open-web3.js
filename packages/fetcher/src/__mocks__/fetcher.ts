import { PriceFetcher } from '../types';

const prices: { [key: string]: { [key: string]: string } } = {
  bittrex: {
    'ETH/USDT': '149.85',
    'BTC/USDT': '7303.36'
  },
  coinbase: {
    'ETH/USD': '151.02',
    'BTC/USD': '7318.28'
  },
  kraken: {
    'ETH/USD': '150.53'
  },
  CCCAGG: {
    'ETH/USD': '152.42',
    'BTC/USD': '7310.38'
  }
};

export default class Fetcher implements PriceFetcher {
  public weight = 1;
  private readonly exchange: any;

  constructor(public readonly source: string) {
    this.exchange = prices[source];
  }

  getPrice(pair: string): Promise<string> {
    const price = this.exchange[pair];
    if (!price) return Promise.reject(Error('failed'));

    return Promise.resolve(price);
  }
}
