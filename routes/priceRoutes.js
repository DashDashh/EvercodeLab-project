const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const currencyRepository = require("../services/repositories/CurrencyRepository");
const exchangeRateRepository = require("../services/repositories/ExchangeRateRepository");
const priceUpdateService = require("../services/PriceUpdateService");
const { logger } = require("../utils/logger");

const router = express.Router();

router.use(authenticateToken);

router.get("/", async (req, res, next) => {
  try {
    const { currency } = req.query;

    if (!currency) {
      return res.status(400).json({
        success: false,
        message: "Параметр currency обязателен",
      });
    }

    const upperCurrency = currency.toUpperCase();

    const currencyExists = await currencyRepository.findByTicker(upperCurrency);

    if (!currencyExists) {
      return res.status(404).json({
        success: false,
        message: `Валюта ${upperCurrency} не найдена в базе данных`,
      });
    }

    const rates = await exchangeRateRepository.findAllByCurrency(upperCurrency);

    const lastUpdate =
      await exchangeRateRepository.getLastUpdateTime(upperCurrency);

    res.status(200).json({
      success: true,
      data: {
        currency: upperCurrency,
        source: "Database (updated by background task)",
        lastUpdate: lastUpdate,
        totalPairs: rates.length,
        pairs: rates.map((rate) => ({
          symbol: rate.symbol,
          price: rate.price,
          priceChange: rate.price_change,
          priceChangePercent: rate.price_change_percent,
          highPrice: rate.high_price,
          lowPrice: rate.low_price,
          volume: rate.volume,
        })),
      },
    });
  } catch (error) {
    logger(error.message, "error");
    next(error);
  }
});

router.get("/status", async (req, res, next) => {
  try {
    const status = priceUpdateService.getStatus();

    const db = await exchangeRateRepository.getDb();
    const stats = await db.get(`
      SELECT 
        COUNT(DISTINCT currency_ticker) as currencies_count,
        COUNT(*) as total_rates,
        MAX(updated_at) as last_global_update
      FROM exchange_rates
    `);

    res.status(200).json({
      success: true,
      data: {
        backgroundTask: status,
        databaseStats: stats,
        message: "Prices are updated every minute by background task",
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/all", async (req, res, next) => {
  try {
    const allPrices = await binanceService.getAllPrices();
    const currenciesSet = new Set();

    allPrices.forEach((item) => {
      const match = item.symbol.match(
        /^([A-Z]{2,5})(USDT|BUSD|BTC|ETH|BNB|USDC|DAI|TUSD)$/,
      );
      if (match && match[1].length >= 2 && match[1].length <= 5) {
        currenciesSet.add(match[1]);
      }
    });

    const currencies = Array.from(currenciesSet).sort();

    res.status(200).json({
      success: true,
      data: {
        currencies: currencies,
        total: currencies.length,
        timestamp: new Date().toISOString(),
        source: "Binance API",
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
