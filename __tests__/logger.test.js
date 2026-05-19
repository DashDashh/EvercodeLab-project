const { logger, createLogger, setLogLevel, LOG_LEVELS } = require("../logger");

describe("Logger", () => {
  let consoleLogSpy;
  let consoleErrorSpy;
  let consoleWarnSpy;
  let consoleDebugSpy;
  let consoleTraceSpy;

  beforeAll(() => {
    setLogLevel("trace");
  });

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
    consoleDebugSpy = jest.spyOn(console, "debug").mockImplementation();
    consoleTraceSpy = jest.spyOn(console, "trace").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("log info message", () => {
    logger("Test message", "info");
    expect(consoleLogSpy).toHaveBeenCalled();
  });

  test("log error message", () => {
    logger("Error", "error");
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  test("log warn message", () => {
    logger("Warning", "warn");
    expect(consoleWarnSpy).toHaveBeenCalled();
  });

  test("log debug message", () => {
    logger("Debugging", "debug");
    expect(consoleDebugSpy).toHaveBeenCalled();
  });

  test("Log trace message", () => {
    logger("Trace", "trace");
    expect(consoleTraceSpy).toHaveBeenCalled();
  });

  test("use level info by default", () => {
    logger("Message without level");
    expect(consoleLogSpy).toHaveBeenCalled();
  });

  test("formats message with requestId", () => {
    logger("Тест", "info", "req-123");
    const call = consoleLogSpy.mock.calls[0][0];
    expect(call).toContain("[req-123]");
  });

  test("createLogger creates logger with defaultRequestId", () => {
    const reqLogger = createLogger("default-req");
    reqLogger("Тест", "info");

    const call = consoleLogSpy.mock.calls[0][0];
    expect(call).toContain("[default-req]");
  });
});
