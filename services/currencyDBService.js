const { connectDB } = require("../config/database");

class CurrencyDbService {
  constructor() {
    this.db = null;
  }

  async getDb() {
    if (!this.db) {
      this.db = await connectDB();
    }
    return this.db;
  }

  async create(name, ticker) {
    const db = await this.getDb();
    const now = new Date().toISOString();

    const result = await db.run(
      `INSERT INTO currencies (name, ticker, created_at, updated_at) 
       VALUES (?, ?, ?, ?)`,
      [name, ticker.toUpperCase(), now, now],
    );

    const currency = await this.getById(result.lastID);
    return currency;
  }

  async getAll() {
    const db = await this.getDb();
    const currencies = await db.all(
      `SELECT id, name, ticker, created_at as createdAt, updated_at as updatedAt 
       FROM currencies 
       ORDER BY id`,
    );
    return currencies;
  }

  async getById(id) {
    const db = await this.getDb();
    const currency = await db.get(
      `SELECT id, name, ticker, created_at as createdAt, updated_at as updatedAt 
       FROM currencies 
       WHERE id = ?`,
      [id],
    );
    return currency || null;
  }

  async getByTicker(ticker) {
    const db = await this.getDb();
    const currency = await db.get(
      `SELECT id, name, ticker, created_at as createdAt, updated_at as updatedAt 
       FROM currencies 
       WHERE ticker = ?`,
      [ticker.toUpperCase()],
    );
    return currency || null;
  }

  async update(id, name, ticker) {
    const db = await this.getDb();
    const currency = await this.getById(id);
    if (!currency) return null;

    const now = new Date().toISOString();
    const newName = name || currency.name;
    const newTicker = ticker ? ticker.toUpperCase() : currency.ticker;

    await db.run(
      `UPDATE currencies SET name = ?, ticker = ?, updated_at = ? WHERE id = ?`,
      [newName, newTicker, now, id],
    );

    return this.getById(id);
  }

  async delete(id) {
    const db = await this.getDb();
    const result = await db.run(`DELETE FROM currencies WHERE id = ?`, [id]);
    return result.changes > 0;
  }

  async existsByTicker(ticker) {
    const db = await this.getDb();
    const result = await db.get(
      `SELECT 1 FROM currencies WHERE ticker = ? LIMIT 1`,
      [ticker.toUpperCase()],
    );
    return !!result;
  }

  async getCount() {
    const db = await this.getDb();
    const result = await db.get(`SELECT COUNT(*) as count FROM currencies`);
    return result.count;
  }

  async close() {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

module.exports = new CurrencyDbService();
