const express = require("express");
const config = require("./config");
const { logger } = require("./logger");
const { scheduleTask, getActiveTasks, stopAllTasks } = require("./scheduler");
const { authenticateToken } = require("./middleware/auth");
const currencyService = require("./services/currencyDBService");
const binanceService = require("./services/binanceService");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  logger(`${req.method} ${req.path}`, "debug");
  next();
});

app.get("/status", (req, res) => {
  res.status(200).send("ok");
});

app.get("/health", authenticateToken, (req, res) => {
  res.status(200).json({
    status: "ok",
    appName: config.appName,
    environment: config.environment,
    version: config.version,
    timestamp: new Date().toISOString(),
    activeTasks: getActiveTasks().map((task) => ({
      name: task.name,
      interval: task.interval,
    })),
  });
});

app.get("/api/currencies", authenticateToken, async (req, res) => {
  try {
    const currencies = await currencyService.getAll();
    res.status(200).json({
      success: true,
      data: currencies,
      count: currencies.length,
    });
  } catch (error) {
    logger(error.message, "error");
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

app.get("/api/currencies/:id", authenticateToken, async (req, res) => {
  try {
    const currency = await currencyService.getById(req.params.id);
    if (!currency) {
      return res.status(404).json({ success: false, error: "Not Found" });
    }
    res.status(200).json({ success: true, data: currency });
  } catch (error) {
    logger(error.message, "error");
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

app.post("/api/currencies", authenticateToken, async (req, res) => {
  try {
    const { name, ticker } = req.body;

    if (!name || !ticker) {
      return res
        .status(400)
        .json({ success: false, message: "name и ticker обязательны" });
    }

    const exists = await currencyService.existsByTicker(ticker);
    if (exists) {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "Тикер уже существует",
      });
    }

    const currency = await currencyService.create(name, ticker);
    res.status(201).json({ success: true, data: currency });
  } catch (error) {
    logger(error.message, "error");
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

app.put("/api/currencies/:id", authenticateToken, async (req, res) => {
  try {
    const { name, ticker } = req.body;
    const currency = await currencyService.update(req.params.id, name, ticker);
    if (!currency) {
      return res.status(404).json({ success: false, error: "Not Found" });
    }
    res.status(200).json({ success: true, data: currency });
  } catch (error) {
    logger(error.message, "error");
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

app.delete("/api/currencies/:id", authenticateToken, async (req, res) => {
  try {
    const deleted = await currencyService.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Not Found" });
    }
    res.status(200).json({ success: true, message: "Валюта удалена" });
  } catch (error) {
    logger(error.message, "error");
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

app.get("/price", authenticateToken, async (req, res) => {
  try {
    const { currency } = req.query;
    if (!currency) {
      return res.status(400).json({
        success: false,
        message: "Параметр currency обязателен",
      });
    }

    const upperCurrency = currency.toUpperCase();
    const exists = await currencyService.existsByTicker(upperCurrency);

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: `Валюта ${upperCurrency} не найдена в базе данных`,
      });
    }

    const prices = await binanceService.getPricesByCurrency(upperCurrency);

    res.status(200).json({
      success: true,
      data: {
        currency: upperCurrency,
        source: "Binance API",
        totalPairs: prices.length,
        pairs: prices.map((p) => ({
          symbol: p.symbol,
          price: p.price,
        })),
      },
    });
  } catch (error) {
    logger(error.message, "error");
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

app.get("/price/all", authenticateToken, async (req, res) => {
  try {
    const allPrices = await binanceService.getAllPrices();

    const currenciesSet = new Set();

    allPrices.forEach((item) => {
      const symbol = item.symbol;
      const match = symbol.match(
        /^([A-Z]{2,5})(USDT|BUSD|BTC|ETH|BNB|USDC|DAI|TUSD)$/,
      );
      if (match && match[1].length >= 2 && match[1].length <= 5) {
        currenciesSet.add(match[1]);
      }
    });

    const currencies = Array.from(currenciesSet).sort();

    res.status(200).json({
      success: true,
      data: {
        currencies: currencies,
        total: currencies.length,
        timestamp: new Date().toISOString(),
        source: "Binance API",
      },
    });
  } catch (error) {
    logger(error.message, "error");
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

function initializeApp() {
  logger(`Application "${config.appName}" started`, "info");
  logger(`Running in ${config.environment} mode`, "info");
  logger(`Version: ${config.version}`, "debug");
}

function runDemoLogs() {
  logger("This is an informational message", "info");
  logger("This is a warning message", "warn");
  logger("This is an error message", "error");
  logger("This is a debug message", "debug");
}

function runCustomLoggerDemo() {
  const { createLogger } = require("./logger");
  const customLogger = createLogger();
  customLogger("Message from custom logger instance", "info");
}

function setupPeriodicTasks() {
  console.log("\n--- Running periodic tasks ---\n");
  const runningTask = scheduleTask(
    "running-logger",
    10000,
    () => {
      logger("running", "info");
    },
    (errorMsg) => logger(errorMsg, "error"),
  );
  return runningTask;
}

function displayActiveTasks() {
  console.log("\nThe active tasks:");
  getActiveTasks().forEach((task) => {
    console.log(`  ${task.name} (interval: ${task.interval}ms)`);
  });
}

let server = null;

function startServer() {
  const PORT = process.env.PORT || 3000;
  server = app.listen(PORT, () => {
    logger(`HTTP server listening on port ${PORT}`, "info");
    logger(`Health check: http://localhost:${PORT}/status`, "info");
  });
  return server;
}

function setupGracefulShutdown() {
  process.on("SIGINT", async () => {
    console.log("\n\nThe completion signal has been received...");
    stopAllTasks();
    await currencyService.close();
    logger("Database connection closed", "info");
    logger("Application completed", "info");

    if (server) {
      server.close(() => {
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
}

function main() {
  initializeApp();
  runDemoLogs();
  runCustomLoggerDemo();
  setupPeriodicTasks();
  displayActiveTasks();
  startServer();
  setupGracefulShutdown();
}

module.exports = { app, server };

if (require.main === module) {
  main();
}
