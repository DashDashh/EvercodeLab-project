const { logger } = require("./utils/logger");
const priceUpdateService = require("./services/PriceUpdateService");

class TaskScheduler {
  constructor() {
    this.tasks = new Map();
    this.intervals = [];
  }

  scheduleTask(name, intervalMs, taskFn, errorHandler) {
    if (this.tasks.has(name)) {
      logger(
        `Task "${name}" already exists, stopping previous instance`,
        "warn",
      );
      this.stopTask(name);
    }

    const intervalId = setInterval(async () => {
      try {
        logger(`Executing task "${name}"`, "debug");
        await taskFn();
      } catch (error) {
        logger(`Error in task "${name}": ${error.message}`, "error");
        if (errorHandler) {
          errorHandler(error.message);
        }
      }
    }, intervalMs);

    this.tasks.set(name, { intervalId, intervalMs, name });
    this.intervals.push(intervalId);

    logger(`Task "${name}" scheduled with interval ${intervalMs}ms`, "info");
    return { name, intervalMs };
  }

  stopTask(name) {
    const task = this.tasks.get(name);
    if (task) {
      clearInterval(task.intervalId);
      this.tasks.delete(name);
      this.intervals = this.intervals.filter((id) => id !== task.intervalId);
      logger(`Task "${name}" stopped`, "info");
      return true;
    }
    return false;
  }

  stopAllTasks() {
    this.intervals.forEach((intervalId) => clearInterval(intervalId));
    this.tasks.clear();
    this.intervals = [];
    logger("All tasks stopped", "info");
  }

  getActiveTasks() {
    return Array.from(this.tasks.values()).map((task) => ({
      name: task.name,
      interval: task.intervalMs,
    }));
  }
}

const scheduler = new TaskScheduler();

function startPriceUpdateTask() {
  return scheduler.scheduleTask(
    "price-updater",
    60000,
    async () => {
      await priceUpdateService.updateAllCurrenciesPrices();
    },
    (errorMsg) => logger(`Price update task error: ${errorMsg}`, "error"),
  );
}

module.exports = {
  scheduler,
  scheduleTask: scheduler.scheduleTask.bind(scheduler),
  stopTask: scheduler.stopTask.bind(scheduler),
  stopAllTasks: scheduler.stopAllTasks.bind(scheduler),
  getActiveTasks: scheduler.getActiveTasks.bind(scheduler),
  startPriceUpdateTask,
};
