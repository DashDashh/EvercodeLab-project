//Базовый класс для всех кастомных ошибок
class BaseError extends Error {
  constructor(message, statusCode = 500, context = {}) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
    this.context = context;

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      context: this.context,
      stack: this.stack,
    };
  }

  toString() {
    return `${this.name}: ${this.message} (Status: ${this.statusCode})`;
  }

  getClientResponse() {
    return {
      error: this.name,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
    };
  }
}

module.exports = BaseError;
