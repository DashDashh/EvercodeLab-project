const { connectDB, initTables, dbPath } = require("../config/database");
const path = require("path");
const fs = require("fs");

async function initializeDatabase() {
  console.log("\nInitializing database...\n");

  let db = null;

  try {
    db = await connectDB();
    await initTables(db);
    console.log("Database tables initialized");

    const result = await db.get("SELECT COUNT(*) as count FROM currencies");
    console.log(`Current currencies count: ${result.count}`);

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
