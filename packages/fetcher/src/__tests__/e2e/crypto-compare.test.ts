import CryptoCompareFetcher from '../../crypto-compare-fetcher';

describe('CryptoCompareFetcher', () => {
  it('getPrice', async () => {
    // Kraken fetcher
    let fetcher = new CryptoCompareFetcher('kraken', '');

    const btc_usd = await fetcher.getPrice('BTC/USD');
    console.log('Kraken BTC/USD', btc_usd);

    const eth_usd = await fetcher.getPrice('ETH/USD');
    console.log('Kraken EHT/USD', eth_usd);

    const eur_usd = await fetcher.getPrice('EUR/USD');
    console.log('Kraken EUR/USD', eur_usd);

    const usd_jpy = await fetcher.getPrice('USD/JPY');
    console.log('Kraken USD/JPY', usd_jpy);
  });
});
