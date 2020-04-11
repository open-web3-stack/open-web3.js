import CCXTFetcher from '../ccxt-fetcher';

describe('CCXTFetcher', () => {
  it('getPrice', async () => {
    let kraken = new CCXTFetcher('kraken');
    await expect(kraken.getPrice('BTC/USD')).resolves.toBeTruthy();
    await expect(kraken.getPrice('ETH/USD')).resolves.toBeTruthy();
    await expect(kraken.getPrice('EUR/USD')).resolves.toBeTruthy();
    await expect(kraken.getPrice('USD/JPY')).resolves.toBeTruthy();

    let binance = new CCXTFetcher('binance');
    await expect(binance.getPrice('BTC/USDT')).resolves.toBeTruthy();
  });
});
