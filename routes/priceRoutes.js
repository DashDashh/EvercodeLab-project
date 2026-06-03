const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const currencyService = require("../services/currencyDbService");
const binanceService = require("../services/binanceService");
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
    const exists = await currencyService.existsByTicker(upperCurrency);

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: `Валюта ${upperCurrency} не найдена в базе данных`,
      });
    }

    const prices = await binanceService.getPricesByCurrency(upperCurrency);

    res.status(200).json({
      success: true,
      data: {
        currency: upperCurrency,
        source: "Binance API",
        totalPairs: prices.length,
        pairs: prices.map((p) => ({ symbol: p.symbol, price: p.price })),
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
