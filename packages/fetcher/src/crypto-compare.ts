import axios from 'axios';
import { FetcherInterface, Exchange, Pair } from '../interfaces';

const baseURL = 'https://min-api.cryptocompare.com';

export default class CryptoCompare implements FetcherInterface {
  private readonly apiKey: string;
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getPrice(exchange: Exchange, pair: Pair): Promise<string> {
    const [quote, base] = pair.split('/');
    const params = {
      e: exchange,
      fsym: quote,
      tsyms: base,
      api_key: this.apiKey
    };
    return axios.get('/data/price', { params, baseURL }).then((res) => {
      const price = res.data[base];
      if (res.status >= 400 || !price) {
        throw new Error(`Price fetch failed (${res.status} ${res.statusText}): ${JSON.stringify(res.data)}.`);
      }
      return String(price);
    });
  }
}
