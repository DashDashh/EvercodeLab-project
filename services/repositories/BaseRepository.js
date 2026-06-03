const { connectDB } = require("../../config/database");

class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
    this.db = null;
  }

  async getDb() {
    if (!this.db) {
      this.db = await connectDB();
    }
    return this.db;
  }

  async findAll() {
    const db = await this.getDb();
    return db.all(`SELECT * FROM ${this.tableName}`);
  }

  async findById(id) {
    const db = await this.getDb();
    return db.get(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
  }

  async findOne(where, params = []) {
    const db = await this.getDb();
    const conditions = Object.keys(where)
      .map((key) => `${key} = ?`)
      .join(" AND ");
    const values = Object.values(where);
    return db.get(
      `SELECT * FROM ${this.tableName} WHERE ${conditions}`,
      ...values,
    );
  }

  async create(data) {
    const db = await this.getDb();
    const keys = Object.keys(data);
    const placeholders = keys.map(() => "?").join(", ");
    const values = Object.values(data);

    const result = await db.run(
      `INSERT INTO ${this.tableName} (${keys.join(", ")}) VALUES (${placeholders})`,
      ...values,
    );

    return this.findById(result.lastID);
  }

  async update(id, data) {
    const db = await this.getDb();
    const sets = Object.keys(data)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = [...Object.values(data), id];

    await db.run(
      `UPDATE ${this.tableName} SET ${sets} WHERE id = ?`,
      ...values,
    );

    return this.findById(id);
  }

  async delete(id) {
    const db = await this.getDb();
    const result = await db.run(`DELETE FROM ${this.tableName} WHERE id = ?`, [
      id,
    ]);
    return result.changes > 0;
  }

  async exists(where) {
    const db = await this.getDb();
    const conditions = Object.keys(where)
      .map((key) => `${key} = ?`)
      .join(" AND ");
    const values = Object.values(where);
    const result = await db.get(
      `SELECT 1 FROM ${this.tableName} WHERE ${conditions} LIMIT 1`,
      ...values,
    );
    return !!result;
  }

  async close() {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

module.exports = BaseRepository;
