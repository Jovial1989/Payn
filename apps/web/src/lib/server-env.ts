import "server-only";

export const serverEnv = {
  openExchangeRatesAppId: process.env.OPEN_EXCHANGE_RATES_APP_ID ?? "",
  exchangeRateHostAccessKey: process.env.EXCHANGERATE_HOST_ACCESS_KEY ?? "",
  coinGeckoApiKey:
    process.env.COINGECKO_API_KEY ?? process.env.COINGECKO_DEMO_API_KEY ?? "",
  finnhubApiKey: process.env.FINNHUB_API_KEY ?? "",
};
