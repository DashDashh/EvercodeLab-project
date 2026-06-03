const { logger } = require("../utils/logger");
const { BaseError } = require("../errors");

function errorHandler(err, req, res, next) {
  logger(`Error: ${err.message}`, "error");

  if (err instanceof BaseError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.name,
      message: err.message,
      timestamp: err.timestamp,
      ...(err.context && { context: err.context }),
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      error: "Bad Request",
      message: "Неверный формат JSON",
    });
  }

  const isDev = process.env.NODE_ENV === "development";
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: "Внутренняя ошибка сервера",
    ...(isDev && { stack: err.stack }),
  });
}

module.exports = { errorHandler };
