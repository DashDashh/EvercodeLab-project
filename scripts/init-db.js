const { connectDB, initTables, dbPath } = require("../config/database");

async function initializeDatabase() {
  console.log("\nInitializing database...\n");

  let db = null;

  try {
    db = await connectDB();
    await initTables(db);
    console.log("Database tables initialized");

    const currenciesCount = await db.get(
      "SELECT COUNT(*) as count FROM currencies",
    );
    console.log(`Current currencies count: ${currenciesCount.count}`);

    const ratesCount = await db.get(
      "SELECT COUNT(*) as count FROM exchange_rates",
    );
    console.log(`Current exchange rates count: ${ratesCount.count}`);

    console.log("\nDatabase initialization completed successfully!");
    console.log(`Database file location: ${dbPath}`);
  } catch (error) {
    console.error("\nDatabase initialization failed:", error.message);
    process.exit(1);
  } finally {
    if (db) {
      await db.close();
    }
  }
}

if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;
