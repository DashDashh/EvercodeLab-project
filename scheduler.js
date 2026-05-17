const activeTasks = new Map();

function scheduleTask(name, interval, task, onError = console.error) {
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
    stopTask(name);
  }

  const intervalId = setInterval(() => {
    try {
      task();
    } catch (error) {
      onError(`Error in task "${name}": ${error.message}`);
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
    return false;
  }

  clearInterval(task.id);
  activeTasks.delete(name);
  return true;
}

function stopAllTasks() {
  for (const [name, task] of activeTasks) {
    clearInterval(task.id);
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
