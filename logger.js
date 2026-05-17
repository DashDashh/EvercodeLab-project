const config = require("./config");

function formatMessage(level, message) {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${config.appName}] [${level.toUpperCase()}]: ${message}`;
}

function createLogger() {
  return function (message, level = "info") {
    const formattedMessage = formatMessage(level, message);

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
      default:
        console.log(formattedMessage);
    }
  };
}

const logger = createLogger();

module.exports = {
  logger,
  createLogger,
};
