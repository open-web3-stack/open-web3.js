import assert from 'assert';
import axios from 'axios';
import { PriceFetcher } from './types';

const baseURL = 'https://api.coingecko.com/api/v3';

export default class CoinGeckoFetcher implements PriceFetcher {
  public readonly source = 'coingecko';

  /**
   * Creates an instance of CoinGecko
   * @param weight Weight of the price source. Used by CombinedFetcher. Default = 1
   * @param ids IDs mapping i.e: { btc: 'bitcoin', eth: 'ethereum', dot: 'polkadot', kar: 'karura' }
   * @param timeout Request timeout
   */
  constructor(
    public readonly weight = 1,
    private readonly ids: Record<string, string>,
    private readonly timeout = 2_000
  ) {
    assert(Number.isInteger(weight), 'Weight should be integer');
  }

  /**
   * Fetch price for a given pair.
   * @param pair Pair symbol i.e: BTC/USD
   * @returns Price
   */
  async getPrice(pair: string) {
    const [base, quote] = pair
      .split('/')
      .map((i) => i.toLowerCase())
      .map((i) => this.ids[i] || i);

    const params = {
      ids: base,
      vs_currencies: quote
    };

    const result = await axios.get('/simple/price', { params, baseURL, timeout: this.timeout });

    const price = result.data[base]?.[quote];

    if (result.status >= 400 || !price) {
      throw Error(`Price fetch failed (${result.status} ${result.statusText}): ${JSON.stringify(result.data)}.`);
    }

    return String(price);
  }
}
