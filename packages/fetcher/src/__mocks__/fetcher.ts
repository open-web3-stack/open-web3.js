import { Exchange, Pair } from '../../interfaces';

const prices: { [key in Exchange]?: { [key in Pair]?: string } } = {
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

export default class Fetcher {
  getPrice(exchange: Exchange, pair: Pair): Promise<string> {
    let x = prices[exchange];
    if (!x) return Promise.reject();

    let price = x[pair];
    if (!price) return Promise.reject();

    return Promise.resolve(price);
  }
}
