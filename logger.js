const config = require("./config");

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4,
};

let currentLevel =
  LOG_LEVELS[config.logLevel?.toLowerCase()] ?? LOG_LEVELS.info;

function setLogLevel(level) {
  if (typeof level === "string") {
    currentLevel = LOG_LEVELS[level.toLowerCase()] ?? LOG_LEVELS.info;
  } else {
    currentLevel = level;
  }
}

function formatMessage(level, message, requestId = null) {
  const timestamp = new Date().toISOString();
  let formatted = `[${timestamp}] [${config.appName}] [${level.toUpperCase()}]`;

  if (requestId) {
    formatted += ` [${requestId}]`;
  }

  formatted += `: ${message}`;
  return formatted;
}

function createLogger(defaultRequestId = null) {
  return function (message, level = "info", requestId = null) {
    const levelPriority = LOG_LEVELS[level.toLowerCase()];
    if (levelPriority === undefined || levelPriority > currentLevel) {
      return;
    }

    const finalRequestId = requestId || defaultRequestId;
    const formattedMessage = formatMessage(level, message, finalRequestId);

    switch (level.toLowerCase()) {
      case "error":
        console.error(formattedMessage);
        break;
      case "warn":
        console.warn(formattedMessage);
        break;
      case "debug":
        console.debug(formattedMessage);
        break;
      case "trace":
        console.trace(formattedMessage);
        break;
      default:
        console.log(formattedMessage);
    }
  };
}

const logger = createLogger();

module.exports = {
  logger,
  createLogger,
  setLogLevel,
  LOG_LEVELS,
};
