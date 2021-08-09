import axios from 'axios';
import { PriceFetcher } from './types';

const baseURL = 'https://min-api.cryptocompare.com';

/**
 * CryptoCompareFetcher
 *
 * @export
 * @class CryptoCompareFetcher
 * @implements {PriceFetcher}
 */
export default class CryptoCompareFetcher implements PriceFetcher {
  /**
   * Creates an instance of CryptoCompareFetcher.
   * @param {string} source
   * @param {string} apiKey
   * @param {number} timeout milliseconds
   * @memberof CryptoCompareFetcher
   */
  constructor(public readonly source: string, private readonly apiKey: string, private readonly timeout = 2000) {}

  /**
   * Fetch price for a give pair.
   *
   * @param {string} pair base/quote
   * @returns {Promise<string>}
   * @memberof CryptoCompareFetcher
   */
  getPrice(pair: string): Promise<string> {
    const [base, quote] = pair.split('/');
    const params = {
      e: this.source,
      fsym: base,
      tsyms: quote,
      api_key: this.apiKey
    };
    return axios.get('/data/price', { params, baseURL, timeout: this.timeout }).then((res) => {
      const price = res.data[quote];
      if (res.status >= 400 || !price) {
        throw Error(`Price fetch failed (${res.status} ${res.statusText}): ${JSON.stringify(res.data)}.`);
      }
      return String(price);
    });
  }
}
