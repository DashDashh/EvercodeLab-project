const { logger } = require("./logger");

console.log("[SYNC] scheduler.js initialized");
logger("scheduler.js module loaded", "info");

const activeTasks = new Map();

function scheduleTask(name, interval, task) {
  if (typeof name !== "string" || name.trim() === "") {
    throw new Error("The task name must be a non-empty string");
  }

  if (typeof interval !== "number" || interval <= 0) {
    throw new Error("The interval must be a positive number");
  }

  if (typeof task !== "function") {
    throw new Error("The task must be function");
  }

  if (activeTasks.has(name)) {
    logger(`Stopping an existing task "${name}"`, "warn");
    stopTask(name);
  }

  logger(`Task created "${name}" with interval ${interval}ms`, "info");

  const intervalId = setInterval(() => {
    try {
      task();
    } catch (error) {
      logger(`Error in task "${name}": ${error.message}`, "error");
    }
  }, interval);

  activeTasks.set(name, {
    id: intervalId,
    interval: interval,
    name: name,
    startTime: new Date(),
  });

  return {
    stop: () => stopTask(name),
    isRunning: () => activeTasks.has(name),
    getName: () => name,
    getInterval: () => interval,
  };
}

function stopTask(name) {
  const task = activeTasks.get(name);

  if (!task) {
    logger(`Task "${name}" not found`, "warn");
    return false;
  }

  clearInterval(task.id);

  activeTasks.delete(name);

  logger(`Task "${name}" stopped`, "info");
  return true;
}

function stopAllTasks() {
  logger(`Stopping all tasks (${activeTasks.size} active)`, "info");

  for (const [name, task] of activeTasks) {
    clearInterval(task.id);
    logger(`The "${name}" task has been stopped`, "debug");
  }

  activeTasks.clear();
}

function getActiveTasks() {
  return Array.from(activeTasks.entries()).map(([name, task]) => ({
    name: name,
    interval: task.interval,
    startTime: task.startTime,
    runningTime: Date.now() - task.startTime.getTime(),
  }));
}

module.exports = {
  scheduleTask,
  stopTask,
  stopAllTasks,
  getActiveTasks,
};

console.log("[SYNC] scheduler.js is ready to use");
