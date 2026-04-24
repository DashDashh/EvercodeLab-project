const config = require("./config");
const { logger } = require("./logger");

logger(`Application "${config.appName}" started`, "info");
logger(`Running in ${config.environment} mode`, "info");
logger(`Version: ${config.version}`, "debug");

logger("This is an informational message", "info");
logger("This is a warning message", "warn");
logger("This is an error message", "error");
logger("This is a debug message", "debug");

const { createLogger } = require("./logger");
const customLogger = createLogger();
customLogger("Message from custom logger instance", "info");
