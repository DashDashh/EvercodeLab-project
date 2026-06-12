const app = require("./app");
const config = require("./config");
const { logger } = require("./utils/logger");
const {
  scheduler,
  stopAllTasks,
  startPriceUpdateTask,
  getActiveTasks,
} = require("./scheduler");
const currencyService = require("./services/currencyService");

let server = null;

function setupPeriodicTasks() {
  console.log("\n--- Setting up periodic tasks ---\n");

  startPriceUpdateTask();

  scheduler.scheduleTask(
    "demo-logger",
    10000,
    () => {
      logger("running", "info");
    },
    (errorMsg) => logger(errorMsg, "error"),
  );
}

function displayActiveTasks() {
  console.log("\nThe active tasks:");
  getActiveTasks().forEach((task) => {
    console.log(`  ${task.name} (interval: ${task.interval}ms)`);
  });
}

function setupGracefulShutdown() {
  process.on("SIGINT", async () => {
    console.log("\n\nThe completion signal has been received...");
    stopAllTasks();
    await currencyService.close();
    logger("Database connection closed", "info");
    logger("Application completed", "info");

    if (server) {
      server.close(() => process.exit(0));
    } else {
      process.exit(0);
    }
  });
}

async function startServer() {
  const PORT = config.port || 3000;

  server = app.listen(PORT, () => {
    logger(`HTTP server listening on port ${PORT}`, "info");
    logger(`Health check: http://localhost:${PORT}/status`, "info");
  });

  return server;
}

async function main() {
  logger(`Application "${config.appName}" started`, "info");
  logger(`Running in ${config.environment} mode`, "info");
  logger(`Version: ${config.version}`, "debug");

  // Демо логи
  logger("This is an informational message", "info");
  logger("This is a warning message", "warn");
  logger("This is an error message", "error");
  logger("This is a debug message", "debug");

  const { createLogger } = require("./utils/logger");
  const customLogger = createLogger();
  customLogger("Message from custom logger instance", "info");

  setupPeriodicTasks();
  displayActiveTasks();
  await startServer();
  setupGracefulShutdown();
}

if (require.main === module) {
  main();
}

module.exports = { server };
