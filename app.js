const config = require("./config");
const { logger } = require("./logger");
const { scheduleTask, getActiveTasks, stopAllTasks } = require("./scheduler");

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

function main() {
  initializeApp();
  runDemoLogs();
  runCustomLoggerDemo();
  setupPeriodicTasks();
  displayActiveTasks();
  setupGracefulShutdown();
}

main();
