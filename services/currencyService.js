const Currency = require("../models/Currency");

class CurrencyService {
  constructor() {
    this.currencies = new Map();
    this.nextId = 1;
  }

  create(name, ticker) {
    const id = String(this.nextId++);
    const currency = new Currency(id, name, ticker.toUpperCase());
    this.currencies.set(id, currency);
    return currency;
  }

  getAll() {
    return Array.from(this.currencies.values()).map((c) => c.toJSON());
  }

  getById(id) {
    const currency = this.currencies.get(id);
    return currency ? currency.toJSON() : null;
  }

  update(id, name, ticker) {
    const currency = this.currencies.get(id);
    if (!currency) {
      return null;
    }
    currency.update(name, ticker.toUpperCase());
    return currency.toJSON();
  }

  delete(id) {
    return this.currencies.delete(id);
  }

  existsByTicker(ticker) {
    return Array.from(this.currencies.values()).some(
      (c) => c.ticker === ticker.toUpperCase(),
    );
  }
}

module.exports = new CurrencyService();
