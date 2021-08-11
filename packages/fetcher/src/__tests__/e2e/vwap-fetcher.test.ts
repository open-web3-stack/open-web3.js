import CCXTFetcher from '../../ccxt-fetcher';
import VWAPFetcher from '../../vwap-fetcher';

describe('VWAPFetcher', () => {
  it('getPrice', async () => {
    // Kraken fetcher
    let kraken = new VWAPFetcher(new CCXTFetcher('kraken', { timeout: 10_000 }));

    const btc_usd = await kraken.getPrice('BTC/USD');
    console.log('Kraken BTC/USD:', btc_usd);

    const eth_usd = await kraken.getPrice('ETH/USD');
    console.log('Kraken ETH/USD', eth_usd);

    const eur_usd = await kraken.getPrice('EUR/USD');
    console.log('Kraken EUR/USD', eur_usd);

    // Binance fetcher
    let binance = new VWAPFetcher(new CCXTFetcher('binance', {  timeout: 10_000 }));

    const btc_usd2 = await kraken.getPrice('BTC/USD');
    console.log('Kraken BTC/USD:', btc_usd2);

    const btc_usdt = await binance.getPrice('BTC/USDT');
    console.log('Binance BTC/USDT', btc_usdt);
  }, 50_000);
});
