import CCXTFetcher from '../../ccxt-fetcher';

describe('CCXTFetcher', () => {
  it('getPrice', async () => {
    // Kraken fetcher
    let kraken = new CCXTFetcher('kraken');

    const btc_usd = await kraken.getPrice('BTC/USD');
    console.log('Kraken BTC/USD:', btc_usd);

    const eth_usd = await kraken.getPrice('ETH/USD');
    console.log('Kraken ETH/USD', eth_usd);

    const eur_usd = await kraken.getPrice('EUR/USD');
    console.log('Kraken EUR/USD', eur_usd);

    const usd_jpy = await kraken.getPrice('USD/JPY');
    console.log('Kraken USD/JPY', usd_jpy);

    // Binance fetcher
    let binance = new CCXTFetcher('binance');

    const btc_usdt = await binance.getPrice('BTC/USDT');
    console.log('Binance BTC/USDT', btc_usdt);
  }, 30_000);
});
