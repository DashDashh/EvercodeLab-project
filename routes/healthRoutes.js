const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const config = require("../config");
const { getActiveTasks } = require("../scheduler");

const router = express.Router();

router.get("/", authenticateToken, (req, res) => {
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

module.exports = router;
