const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const fs = require("fs");

const dbPath =
  process.env.DB_PATH || path.join(__dirname, "..", "data", "currencies.db");

async function connectDB() {
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  return db;
}

async function initTables(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS currencies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      ticker TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS exchange_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      currency_ticker TEXT NOT NULL,
      symbol TEXT NOT NULL,
      price TEXT NOT NULL,
      price_change TEXT,
      price_change_percent TEXT,
      high_price TEXT,
      low_price TEXT,
      volume TEXT,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (currency_ticker) REFERENCES currencies(ticker),
      UNIQUE(currency_ticker, symbol)
    )
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_exchange_rates_currency_ticker 
    ON exchange_rates (currency_ticker)
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_currencies_ticker 
    ON currencies (ticker)
  `);
}

module.exports = {
  connectDB,
  initTables,
  dbPath,
};
