const binanceService = require("./binanceService");
const currencyRepository = require("./repositories/CurrencyRepository");
const exchangeRateRepository = require("./repositories/ExchangeRateRepository");
const { logger } = require("../utils/logger");

class PriceUpdateService {
  constructor() {
    this.isRunning = false;
    this.lastUpdateTime = null;
  }

  async updateAllCurrenciesPrices() {
    const startTime = Date.now();
    logger("Starting price update for all currencies...", "info");

    try {
      const currencies = await currencyRepository.findAll();

      if (currencies.length === 0) {
        logger("No currencies found in database", "warn");
        return {
          success: true,
          updatedCount: 0,
          message: "No currencies to update",
        };
      }

      let totalUpdatedPairs = 0;
      const results = [];

      for (const currency of currencies) {
        try {
          const ticker = currency.ticker;
          logger(`Updating prices for ${ticker}...`, "debug");

          const prices = await binanceService.getPricesByCurrency(ticker);
          const tickers = await binanceService.getFullTickersByCurrency(ticker);

          let updatedPairs = 0;

          for (const price of prices) {
            const tickerData = tickers.find((t) => t.symbol === price.symbol);

            await exchangeRateRepository.upsertRate(ticker, {
              symbol: price.symbol,
              price: price.price,
              priceChange: tickerData?.priceChange,
              priceChangePercent: tickerData?.priceChangePercent,
              highPrice: tickerData?.highPrice,
              lowPrice: tickerData?.lowPrice,
              volume: tickerData?.volume,
            });
            updatedPairs++;
          }

          totalUpdatedPairs += updatedPairs;
          results.push({
            currency: ticker,
            pairsUpdated: updatedPairs,
            success: true,
          });

          logger(`Updated ${updatedPairs} pairs for ${ticker}`, "debug");
        } catch (error) {
          logger(
            `Failed to update prices for ${currency.ticker}: ${error.message}`,
            "error",
          );
          results.push({
            currency: currency.ticker,
            error: error.message,
            success: false,
          });
        }
      }

      this.lastUpdateTime = new Date().toISOString();
      const duration = Date.now() - startTime;

      logger(
        `Price update completed in ${duration}ms. Updated ${totalUpdatedPairs} pairs across ${currencies.length} currencies`,
        "info",
      );

      return {
        success: true,
        updatedCount: totalUpdatedPairs,
        currenciesCount: currencies.length,
        duration: `${duration}ms`,
        lastUpdate: this.lastUpdateTime,
        results,
      };
    } catch (error) {
      logger(`Failed to update prices: ${error.message}`, "error");
      return {
        success: false,
        error: error.message,
        lastUpdate: this.lastUpdateTime,
      };
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      lastUpdateTime: this.lastUpdateTime,
    };
  }
}

module.exports = new PriceUpdateService();
