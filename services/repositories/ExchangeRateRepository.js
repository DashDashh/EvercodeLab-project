const BaseRepository = require("./BaseRepository");

class ExchangeRateRepository extends BaseRepository {
  constructor() {
    super("exchange_rates");
  }

  async upsertRate(currencyTicker, rateData) {
    const db = await this.getDb();
    const now = new Date().toISOString();

    await db.run(
      `
      INSERT OR REPLACE INTO exchange_rates 
      (currency_ticker, symbol, price, price_change, price_change_percent, 
       high_price, low_price, volume, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        currencyTicker,
        rateData.symbol,
        rateData.price,
        rateData.priceChange || null,
        rateData.priceChangePercent || null,
        rateData.highPrice || null,
        rateData.lowPrice || null,
        rateData.volume || null,
        now,
      ],
    );

    return this.findBySymbol(currencyTicker, rateData.symbol);
  }

  async findBySymbol(currencyTicker, symbol) {
    const db = await this.getDb();
    return db.get(
      `
      SELECT * FROM exchange_rates 
      WHERE currency_ticker = ? AND symbol = ?
    `,
      [currencyTicker, symbol],
    );
  }

  async findAllByCurrency(currencyTicker) {
    const db = await this.getDb();
    return db.all(
      `
      SELECT * FROM exchange_rates 
      WHERE currency_ticker = ?
      ORDER BY symbol
    `,
      [currencyTicker],
    );
  }

  async getLastUpdateTime(currencyTicker) {
    const db = await this.getDb();
    const result = await db.get(
      `
      SELECT MAX(updated_at) as last_update 
      FROM exchange_rates 
      WHERE currency_ticker = ?
    `,
      [currencyTicker],
    );
    return result?.last_update || null;
  }

  async deleteByCurrency(currencyTicker) {
    const db = await this.getDb();
    return db.run(`DELETE FROM exchange_rates WHERE currency_ticker = ?`, [
      currencyTicker,
    ]);
  }
}

module.exports = new ExchangeRateRepository();
