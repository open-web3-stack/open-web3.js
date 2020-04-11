import axios from 'axios';
import { FetcherInterface, Pair } from '../interfaces';

const baseURL = 'https://min-api.cryptocompare.com';

export default class CryptoCompare implements FetcherInterface {
  private readonly source: string;
  private readonly apiKey: string;

  constructor(source: string, apiKey: string) {
    this.source = source;
    this.apiKey = apiKey;
  }

  getPrice(pair: Pair): Promise<string> {
    const [quote, base] = pair.split('/');
    const params = {
      e: this.source,
      fsym: quote,
      tsyms: base,
      api_key: this.apiKey // eslint-disable-line @typescript-eslint/camelcase
    };
    return axios.get('/data/price', { params, baseURL }).then((res) => {
      const price = res.data[base];
      if (res.status >= 400 || !price) {
        throw Error(`Price fetch failed (${res.status} ${res.statusText}): ${JSON.stringify(res.data)}.`);
      }
      return String(price);
    });
  }
}
