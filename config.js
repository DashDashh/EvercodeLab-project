require("dotenv").config();

const config = {
  appName: "EvercodeLab App",
  version: "1.0.0",
  environment: process.env.NODE_ENV || "development",
  logLevel: process.env.LOG_LEVEL || "info",
  apiEndpoint: "https://api.example.com",
  timeout: 5000,
  port: process.env.PORT || 3000,
  apiToken: process.env.API_TOKEN || null,
};

module.exports = config;
