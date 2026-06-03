const BaseRepository = require("./BaseRepository");

class CurrencyRepository extends BaseRepository {
  constructor() {
    super("currencies");
  }

  async findByTicker(ticker) {
    return this.findOne({ ticker: ticker.toUpperCase() });
  }

  async existsByTicker(ticker) {
    return this.exists({ ticker: ticker.toUpperCase() });
  }

  async findAllOrdered() {
    const db = await this.getDb();
    return db.all(`SELECT * FROM ${this.tableName} ORDER BY id`);
  }

  async createCurrency(name, ticker) {
    const now = new Date().toISOString();
    return this.create({
      name: name,
      ticker: ticker.toUpperCase(),
      created_at: now,
      updated_at: now,
    });
  }

  async updateCurrency(id, name, ticker) {
    const now = new Date().toISOString();
    const updateData = { updated_at: now };

    if (name !== undefined) updateData.name = name;
    if (ticker !== undefined) updateData.ticker = ticker.toUpperCase();

    return this.update(id, updateData);
  }

  async transformToJSON(currency) {
    if (!currency) return null;
    return {
      id: currency.id,
      name: currency.name,
      ticker: currency.ticker,
      createdAt: currency.created_at,
      updatedAt: currency.updated_at,
    };
  }

  async transformManyToJSON(currencies) {
    return Promise.all(currencies.map((c) => this.transformToJSON(c)));
  }
}

module.exports = new CurrencyRepository();
