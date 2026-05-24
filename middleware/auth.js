const config = require("../config");
const { logger } = require("../logger");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  logger(`Authorization attempt to ${req.method} ${req.path}`, "debug");

  if (!token) {
    logger("No token provided", "warn");
    return res.status(401).json({
      error: "Unauthorized",
      message: "Токен авторизации отсутствует",
    });
  }

  if (!config.apiToken) {
    logger("API_TOKEN not configured in .env file", "error");
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Ошибка конфигурации сервера",
    });
  }

  if (token !== config.apiToken) {
    logger("Invalid token provided", "warn");
    return res.status(403).json({
      error: "Forbidden",
      message: "Недействительный токен авторизации",
    });
  }

  req.isAuthenticated = true;
  req.authToken = token;

  logger("Authentication successful", "debug");
  next();
}

module.exports = { authenticateToken };
