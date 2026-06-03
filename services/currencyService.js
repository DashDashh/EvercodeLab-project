const CurrencyRepository = require("./repositories/CurrencyRepository");

class CurrencyService {
  constructor(repository) {
    this.repository = repository;
  }

  async create(name, ticker) {
    const currency = await this.repository.createCurrency(name, ticker);
    return this.repository.transformToJSON(currency);
  }

  async getAll() {
    const currencies = await this.repository.findAllOrdered();
    return this.repository.transformManyToJSON(currencies);
  }

  async getById(id) {
    const currency = await this.repository.findById(id);
    return this.repository.transformToJSON(currency);
  }

  async getByTicker(ticker) {
    const currency = await this.repository.findByTicker(ticker);
    return this.repository.transformToJSON(currency);
  }

  async update(id, name, ticker) {
    const currency = await this.repository.updateCurrency(id, name, ticker);
    return this.repository.transformToJSON(currency);
  }

  async delete(id) {
    return this.repository.delete(id);
  }

  async existsByTicker(ticker) {
    return this.repository.existsByTicker(ticker);
  }

  async close() {
    await this.repository.close();
  }
}

const currencyService = new CurrencyService(CurrencyRepository);

module.exports = currencyService;
