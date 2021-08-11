import VWAPFetcher from "../vwap-fetcher";
import { Trade } from '../types'

const input = [100_000, 80_000, 79_999, 70_000, 59_999, 30_000, 9_999, 1].map((timestamp, i) => ({
    timestamp,
    price: i % 2 === 0 ? 2 : 1,
    amount: 1,
} as Trade));

const output = [
    { timestamp: 100_000, amount: 2, price: (2 + 1) / 2 },
    { timestamp: 79_999, amount: 3, price: (2 + 1 + 2) / 3 },
    { timestamp: 30_000, amount: 1, price: 1 },
    { timestamp: 9_999, amount: 2, price: (2 + 1) / 2 }
];

it('aggregate trades', () => {
    const aggragated = VWAPFetcher['aggregateTrades'](input);
    expect(aggragated).toEqual(output);
});
