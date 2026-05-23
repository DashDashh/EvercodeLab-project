const express = require("express");
const config = require("./config");
const { logger } = require("./logger");
const { scheduleTask, getActiveTasks, stopAllTasks } = require("./scheduler");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  logger(`${req.method} ${req.path}`, "debug");
  next();
});

app.get("/status", (req, res) => {
  res.status(200).send("ok");
});

app.get("/health", (req, res) => {
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
