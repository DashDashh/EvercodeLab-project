const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

module.exports = {
  appName: process.env.APP_NAME || "EvercodeLab App",
  environment: process.env.NODE_ENV || "development",
  version: process.env.VERSION || "1.0.0",

  port: parseInt(process.env.PORT) || 3000,
  host: process.env.HOST || "localhost",

  logLevel: process.env.LOG_LEVEL || "info",
  logColor: process.env.LOG_COLOR !== "false",

  apiToken: process.env.API_TOKEN,

  dbPath:
    process.env.DB_PATH || path.join(__dirname, "..", "data", "currencies.db"),

  binanceApiUrl:
    process.env.BINANCE_API_URL || "https://api.binance.com/api/v3",

  isDevelopment: () => process.env.NODE_ENV === "development",
  isProduction: () => process.env.NODE_ENV === "production",
  isTest: () => process.env.NODE_ENV === "test",
};
