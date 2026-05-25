const axios = require("axios");

class BinanceService {
  constructor() {
    this.baseUrl = "https://api.binance.com/api/v3";
  }

  async getAllPrices() {
    try {
      const response = await axios.get(`${this.baseUrl}/ticker/price`);
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка при получении цен из Binance: ${error.message}`);
    }
  }

  async getAll24hrTickers() {
    try {
      const response = await axios.get(`${this.baseUrl}/ticker/24hr`);
      return response.data;
    } catch (error) {
      throw new Error(
        `Ошибка при получении статистики из Binance: ${error.message}`,
      );
    }
  }

  async getPricesByCurrency(currency) {
    const upperCurrency = currency.toUpperCase();
    const allPrices = await this.getAllPrices();

    const filteredPrices = allPrices.filter((item) =>
      item.symbol.includes(upperCurrency),
    );

    return filteredPrices;
  }

  async getFullTickersByCurrency(currency) {
    const upperCurrency = currency.toUpperCase();
    const allTickers = await this.getAll24hrTickers();

    const filteredTickers = allTickers.filter((item) =>
      item.symbol.includes(upperCurrency),
    );

    return filteredTickers;
  }

  async getAllCurrencies() {
    const allPrices = await this.getAllPrices();
    const currencyFrequency = new Map();

    for (const item of allPrices) {
      const symbol = item.symbol;

      const possibleSplit = this.splitSymbol(symbol);

      if (possibleSplit) {
        const { base, quote } = possibleSplit;

        if (!currencyFrequency.has(base)) {
          currencyFrequency.set(base, { count: 0, quotes: new Set() });
        }
        currencyFrequency.get(base).count++;
        currencyFrequency.get(base).quotes.add(quote);
      }
    }

    const currencies = [];

    for (const [currency, data] of currencyFrequency.entries()) {
      if (
        currency.length >= 2 &&
        currency.length <= 6 &&
        /^[A-Z]+$/.test(currency) &&
        data.count >= 2 &&
        data.quotes.size >= 1
      ) {
        currencies.push(currency);
      }
    }

    currencies.sort((a, b) => {
      const freqA = currencyFrequency.get(a).count;
      const freqB = currencyFrequency.get(b).count;
      return freqB - freqA;
    });

    return currencies;
  }

  splitSymbol(symbol) {
    for (let baseLen = 2; baseLen <= 5; baseLen++) {
      const base = symbol.slice(0, baseLen);
      const quote = symbol.slice(baseLen);

      if (
        base &&
        quote &&
        /^[A-Z]+$/.test(base) &&
        /^[A-Z]+$/.test(quote) &&
        quote.length >= 2 &&
        quote.length <= 6
      ) {
        if (base.length <= 6 && quote.length <= 6) {
          return { base, quote };
        }
      }
    }
    return null;
  }

  async getTopCurrencies(limit = 50) {
    const allCurrencies = await this.getAllCurrencies();
    return allCurrencies.slice(0, limit);
  }
}

module.exports = new BinanceService();
