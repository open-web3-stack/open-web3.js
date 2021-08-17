import assert from 'assert';
import { PriceFetcher, TradesFetcher, Trade } from './types';

// weight for each group [0-5min, 5-10min, 10-15min, 15-20min, 20-25min, >25min]
const weights = [1, 0.8, 0.6, 0.4, 0.2, 0.001];

// timeframe to group trades
const timeframe = 5 * 60 * 1_000; // 5min

// Any trade older than 25min will have a weight of 0.001,
// so it's pointless to keep data in cache more than 60min.
// One way of using a greater window might be aggregate old
// trades hourly so they won't take too much memory
const lifetime = 60 * 60 * 1_000; // 60min

export default class VWAPFetcher implements PriceFetcher {
  public weight = 1;
  public readonly source: string;
  private readonly trades: Record<string, Trade[]> = {};
  private readonly lastFed: Record<string, number> = {};
  private readonly prices: Record<string, string> = {};

  /**
   * Create new instance
   *
   * @param exchange TradesFetcher
   * @param tolerance Time period in which the data is considered fresh
   * and there's no need to fetch new data. This helps not hitting the API
   * every seconds. Default value 5sec
   */
  constructor(private readonly exchange: TradesFetcher, private readonly tolerance = 5 * 1_000) {
    assert(this.exchange.hasFetchTrades);
    this.source = this.exchange.source;
  }

  /**
   * Feed manager with new data
   *
   * @param pair Pair symbol
   * @param trades Trades
   * @param timestamp Timestamp when fetch happened
   */
  private feed(pair: string, trades: Trade[], timestamp: number): void {
    this.lastFed[pair] = timestamp;

    if (trades.length === 0) return;
    const validAfter = timestamp - lifetime;

    const oldTrades = this.trades[pair] || [];

    const newTrades = oldTrades.filter((i) => i.timestamp >= validAfter);

    VWAPFetcher.aggregateTrades(trades.sort((a, b) => b.timestamp - a.timestamp)).forEach((i) => newTrades.push(i));

    this.trades[pair] = newTrades;

    const price = VWAPFetcher.calculateVWAP(newTrades, timestamp);

    if (price) {
      this.prices[pair] = price;
    } else {
      delete this.prices[pair];
    }
  }

  /**
   * Get Volume Weight Average Price
   *
   * @param pair Pair symbol
   * @returns vwap
   */
  async getPrice(pair: string) {
    // check if new data is needed
    const [needs, since] = this.needsFeeding(pair);
    if (needs) {
      // fetch new trades
      const timestamp = Date.now();
      const trades = await this.exchange.fetchTrades(pair, since);
      // feed manager
      this.feed(pair, trades, timestamp);
    }
    const price = this.prices[pair];
    if (!price) throw Error('No price available');
    return price;
  }

  /**
   * Get latest trade timestamp
   *
   * @param pair Pair symbol
   * @returns Trade timestamp
   */
  private getLatestTimestamp(pair: string): number {
    const trades = this.trades[pair] || [];
    if (trades.length > 0) {
      return trades[0].timestamp;
    }
    return 0;
  }

  /**
   *  Checks last fed is too old and new feeding is needed
   *
   * @param pair Pair symbol
   * @returns [needs_new_data, since_date]
   */
  private needsFeeding(pair: string): [boolean, number] {
    const now = Date.now();
    const lastFed = this.lastFed[pair] || 0;
    const latest = this.getLatestTimestamp(pair) + 1;
    const period = now - timeframe * 5; // last 25 min
    const since = Math.max(latest, period);
    if (now - lastFed > this.tolerance) {
      return [true, since];
    }
    return [false, 0];
  }

  /**
   * Calculate VWAP
   *
   * @param trades Sorted trades [latest, ..., oldest]
   * @param now Timestamp to be considered current time
   * @returns Volume Weighted Average Price
   */
  private static calculateVWAP(trades: Trade[], now: number): string | undefined {
    // group based on timestamp
    const length = weights.length;
    const grouped: Trade[][] = Array(length).fill([]);
    for (let i = 0; i < length; i++) {
      if (i === length - 1) {
        // rest goes to last group
        grouped[i] = trades;
        break;
      }
      const index = trades.findIndex((x) => x.timestamp < now - timeframe * (i + 1));
      if (index > 0) {
        grouped[i] = trades.slice(0, index);
        trades = trades.slice(index);
      } else {
        grouped[i] = trades;
        trades = [];
        break;
      }
    }

    // calculate vwap
    let cost = 0;
    let volume = 0;
    grouped.forEach((trades, index) => {
      cost += weights[index] * trades.map((i) => i.price * i.amount).reduce((a, i) => a + i, 0);
      volume += weights[index] * trades.map((i) => i.amount).reduce((a, i) => a + i, 0);
    });

    if (volume === 0) return;

    const price = cost / volume;

    return price.toString();
  }

  /**
   * Aggregate trades in timeframes
   *
   * @param trades Trades
   * @param timeframe Timeframe default 20sec
   * @returns Aggregated trades
   */
  private static aggregateTrades(trades: Trade[], timeframe = 20_000): Trade[] {
    const aggregated: Trade[] = [];
    let start = trades[0].timestamp;
    while (true) {
      let group: Trade[];
      const timestamp = start;
      const end = start - timeframe;
      const index = trades.findIndex((i) => i.timestamp < end);
      if (index > 0) {
        group = trades.slice(0, index);
        trades = trades.slice(index);
      } else {
        group = trades;
        trades = [];
      }

      let cost = 0;
      let volume = 0;
      group.forEach((i) => {
        cost += i.price * i.amount;
        volume += i.amount;
      });

      if (volume !== 0) {
        const price = cost / volume;
        const trade = { timestamp, amount: volume, price };
        aggregated.push(trade);
      }

      if (trades.length > 0) {
        start = trades[0].timestamp;
      } else {
        break;
      }
    }
    return aggregated;
  }
}
