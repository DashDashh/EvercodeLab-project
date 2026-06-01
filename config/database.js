const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const dbPath =
  process.env.DB_PATH || path.join(__dirname, "..", "data", "currencies.db");

async function connectDB() {
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    console.log(`Database connected: ${dbPath}`);
    return db;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
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
    CREATE INDEX IF NOT EXISTS idx_currencies_ticker 
    ON currencies (ticker)
  `);

  console.log("Database tables initialized");
}

module.exports = {
  connectDB,
  initTables,
  dbPath,
};
