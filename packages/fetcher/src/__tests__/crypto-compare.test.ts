import CryptoCompareFetcher from '../crypto-compare-fetcher';

describe('CryptoCompareFetcher', () => {
  it('getPrice', async () => {
    let fetcher = new CryptoCompareFetcher('kraken', '');
    await expect(fetcher.getPrice('BTC/USD')).resolves.toBeTruthy();
    await expect(fetcher.getPrice('ETH/USD')).resolves.toBeTruthy();
    await expect(fetcher.getPrice('EUR/USD')).resolves.toBeTruthy();
    await expect(fetcher.getPrice('USD/JPY')).resolves.toBeTruthy();
  });
});
