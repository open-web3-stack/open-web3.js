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
  public weight = 1;
  /**
   * Creates an instance of CryptoCompareFetcher.
   * @param source
   * @param apiKey
   * @param weight Weight of the price source. Used by CombinedFetcher. Default = 1
   * @param timeout milliseconds
   */
  constructor(public readonly source: string, private readonly apiKey: string, private readonly timeout = 2000) {}

  /**
   * Fetch price for a give pair.
   *
   * @param pair Pair symbol base/quote
   * @returns {Promise<string>}
   */
  async getPrice(pair: string): Promise<string> {
    const [base, quote] = pair.split('/');
    const params = {
      e: this.source,
      fsym: base,
      tsyms: quote,
      api_key: this.apiKey
    };
    const res = await axios.get('/data/price', { params, baseURL, timeout: this.timeout });
    const price = res.data[quote];
    if (res.status >= 400 || !price) {
      throw Error(`Price fetch failed (${res.status} ${res.statusText}): ${JSON.stringify(res.data)}.`);
    }
    return String(price);
  }
}
