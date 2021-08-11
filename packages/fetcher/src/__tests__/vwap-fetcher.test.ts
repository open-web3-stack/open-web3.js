import { Trade } from '../types';
import CCXTFetcher from "../ccxt-fetcher";
import VWAPFetcher from "../vwap-fetcher";

CCXTFetcher.prototype['fetchTrades'] = jest.fn(async () => ([]));

const sleep = (n: number) => new Promise(resolve => {
    setTimeout(resolve, n);
});

const timeframe = 5 * 60 * 1_000;

describe('VWAPFetcher', () => {
    const fetcher = new VWAPFetcher(new CCXTFetcher('kraken'));
    const key = "exchange::BTC/USD";

    it('requires fetch since first time', () => {
        const now = Date.now();
        const [needs, since] = fetcher['needsFeeding'](key);
        expect(needs).toBeTruthy();
        expect(since).toBeLessThanOrEqual(now - 5 * timeframe);
        expect(since).toBeGreaterThanOrEqual(now - 5 * timeframe - 10);
    });

    it('should feed data', () => {
        const now = Date.now();
        const timestamps = [now - timeframe - 1, now - timeframe * 2 - 2, now - 130000, now - 100000, now - 200000, now - 1000];
        const data = timestamps.map((x, i) => ({ 
            timestamp: x,
            amount: i + 1,
            price: 123 + i
        } as Trade));
        fetcher['feed'](key, data, now);
        const sorted = fetcher['trades'][key];
        expect(sorted.length).toBe(timestamps.length);
        expect(sorted[0].timestamp).toBeGreaterThan(sorted[1].timestamp);
    });

    it('should return vwap price', async () => {
        const price = await fetcher.getPrice(key);
        expect(Number(price)).toBeCloseTo(126.46);
    });

    it('requires fetch since', async () => {
        const sorted = fetcher['trades'][key];
        let [needs, since] = fetcher['needsFeeding'](key);
        expect(needs).toBeFalsy();
        expect(since).toBe(0);
        await sleep(fetcher['tolerance']);
        [needs, since] = fetcher['needsFeeding'](key);
        expect(needs).toBeTruthy();
        expect(since).toBeGreaterThanOrEqual(sorted[0].timestamp);
    }, fetcher['tolerance']);

    it('should return vwap price after some time has passed', async () => {
        await sleep(25_000);
        const price = await fetcher.getPrice(key);
        expect(Number(price)).toBeCloseTo(126.46);
    }, 30_000);
});
