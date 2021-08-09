import VWAPFetcher from "../vwap-fetcher";
import { Trade } from '../types'

const now = Date.now();
const timeframe = 5 * 60 * 1_000;

const input = [130, 120, 125, 130, 120, 100, 110].map((price, i) => ({
    price,
    amount: 1,
    timestamp: now - timeframe * (i + 1)
} as Trade));

it('calculate volume weighted average price', () => {
    const price = VWAPFetcher['calculateVWAP'](input, now);
    expect(price).toBe('125.6528980679547');
});
