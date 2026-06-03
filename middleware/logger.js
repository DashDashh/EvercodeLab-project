const { logger } = require("../utils/logger");

function requestLogger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger(
      `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`,
      "debug",
    );
  });

  next();
}

module.exports = { requestLogger };
