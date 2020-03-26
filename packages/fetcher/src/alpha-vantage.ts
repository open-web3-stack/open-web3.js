import axios from 'axios';
import moduleLogger from './logger';

const logger = moduleLogger.createLogger('AlphaVantage');

type BodyParser = (body: any) => string | undefined | null;

const REALTIME_EX_RATE = 'Realtime Currency Exchange Rate';
const EXCHANGE_RATE_KEY = '5. Exchange Rate';
const forexBodyParser = (body: any) => body[REALTIME_EX_RATE] && body[REALTIME_EX_RATE][EXCHANGE_RATE_KEY];

const GLOBAL_QUOTE = 'Global Quote';
const CLOSE_PRICE = '05. price';
const stockBodyParser = (body: any) => body[GLOBAL_QUOTE] && body[GLOBAL_QUOTE][CLOSE_PRICE];

export default class AlphaVantage {
  // eslint-disable-next-line no-useless-constructor
  public constructor(private readonly apiKey: string) {}

  private async _getPrice(query: string, bodyToPrice: BodyParser): Promise<string> {
    const res = await axios.get(`https://www.alphavantage.co/query?${query}&apikey=${this.apiKey}`);
    const resBody = res.data;
    const price = bodyToPrice(resBody);
    if (res.status >= 400 || !price) {
      logger.debug('_getPrice', { query, status: res.status, body: resBody });
      throw new Error(`Price fetch failed (${res.status} ${res.statusText}): ${JSON.stringify(resBody)}.`);
    }
    return price;
  }

  public async getForexPrice(from: string, to: string): Promise<string> {
    logger.debug('getForexPrice', { from, to });
    const query = `function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}`;
    return this._getPrice(query, forexBodyParser);
  }

  public async getStockPrice(symbol: string): Promise<string> {
    logger.debug('getStockPrice', { symbol });
    const query = `function=GLOBAL_QUOTE&symbol=${symbol}`;
    return this._getPrice(query, stockBodyParser);
  }

  public getPrice(symbol: string | [string, string]) {
    if (typeof symbol === 'string') {
      return this.getStockPrice(symbol);
    }
    return this.getForexPrice(symbol[0], symbol[1]);
  }

  public getAll(symbols: Array<string | [string, string]>) {
    return Promise.all(symbols.map((s) => this.getPrice(s)));
  }
}
