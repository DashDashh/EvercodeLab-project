const express = require("express");
const config = require("./config");
const { logger } = require("./logger");
const { scheduleTask, getActiveTasks, stopAllTasks } = require("./scheduler");

const { authenticateToken } = require("./middleware/auth");
const currencyService = require("./services/currencyService");

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

app.get("/api/currencies", authenticateToken, (req, res) => {
  const currencies = currencyService.getAll();
  res.status(200).json({
    success: true,
    data: currencies,
    count: currencies.length,
  });
});

app.get("/api/currencies/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const currency = currencyService.getById(id);

  if (!currency) {
    return res.status(404).json({
      success: false,
      error: "Not Found",
      message: `Валюта с id ${id} не найдена`,
    });
  }

  res.status(200).json({
    success: true,
    data: currency,
  });
});

app.post("/api/currencies", authenticateToken, (req, res) => {
  const { name, ticker } = req.body;

  if (!name || !ticker) {
    return res.status(400).json({
      success: false,
      error: "Bad Request",
      message: "Поля name и ticker обязательны",
    });
  }

  if (typeof name !== "string" || typeof ticker !== "string") {
    return res.status(400).json({
      success: false,
      error: "Bad Request",
      message: "name и ticker должны быть строками",
    });
  }

  if (name.length < 1 || name.length > 100) {
    return res.status(400).json({
      success: false,
      error: "Bad Request",
      message: "name должен быть от 1 до 100 символов",
    });
  }

  if (ticker.length < 1 || ticker.length > 10) {
    return res.status(400).json({
      success: false,
      error: "Bad Request",
      message: "ticker должен быть от 1 до 10 символов",
    });
  }

  if (currencyService.existsByTicker(ticker)) {
    return res.status(409).json({
      success: false,
      error: "Conflict",
      message: `Валюта с тикером ${ticker.toUpperCase()} уже существует`,
    });
  }

  const currency = currencyService.create(name, ticker);
  res.status(201).json({
    success: true,
    data: currency,
  });
});

app.put("/api/currencies/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, ticker } = req.body;

  if (!name && !ticker) {
    return res.status(400).json({
      success: false,
      error: "Bad Request",
      message:
        "Нужно указать хотя бы одно поле для обновления (name или ticker)",
    });
  }

  const currency = currencyService.getById(id);
  if (!currency) {
    return res.status(404).json({
      success: false,
      error: "Not Found",
      message: `Валюта с id ${id} не найдена`,
    });
  }

  const newName = name || currency.name;
  const newTicker = ticker || currency.ticker;

  if (ticker && ticker.toUpperCase() !== currency.ticker) {
    if (currencyService.existsByTicker(ticker)) {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: `Валюта с тикером ${ticker.toUpperCase()} уже существует`,
      });
    }
  }

  const updated = currencyService.update(id, newName, newTicker);
  res.status(200).json({
    success: true,
    data: updated,
  });
});

app.delete("/api/currencies/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const currency = currencyService.getById(id);

  if (!currency) {
    return res.status(404).json({
      success: false,
      error: "Not Found",
      message: `Валюта с id ${id} не найдена`,
    });
  }

  currencyService.delete(id);
  res.status(200).json({
    success: true,
    message: `Валюта ${currency.name} (${currency.ticker}) успешно удалена`,
  });
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

function setupGracefulShutdown() {
  process.on("SIGINT", () => {
    console.log("\n\nThe completion signal has been received...");
    stopAllTasks();
    logger("Application completed", "info");
    process.exit(0);
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
