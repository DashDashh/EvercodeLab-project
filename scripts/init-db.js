const { connectDB, initTables } = require("../config/database");
const path = require("path");
const fs = require("fs");

async function initializeDatabase() {
  console.log("Initializing database...\n");

  const dbDir = path.join(__dirname, "..", "data");
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log(`Created database directory: ${dbDir}`);
  }

  try {
    const db = await connectDB();

    await initTables(db);
    console.log("Tables created successfully");

    const count = await db.get("SELECT COUNT(*) as count FROM currencies");
    console.log(`Current currencies count: ${count.count}`);

    await db.close();

    console.log("\nDatabase initialization completed!");
    console.log(
      `Database file location: ${require("../config/database").dbPath}`,
    );
  } catch (error) {
    console.error("\nDatabase initialization failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;
