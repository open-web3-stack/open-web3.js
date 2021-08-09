export interface PriceFetcher {
  source: string;
  getPrice(pair: string): Promise<string>;
}

export interface Trade {
  amount: number; // amount of base currency
  price: number; // float price in quote currency
  timestamp: number; // Unix timestamp in milliseconds
}

export interface TradesFetcher {
  source: string;
  hasFetchTrades: boolean;
  fetchTrades(symbol: string, since: number): Promise<Trade[]>;
}
