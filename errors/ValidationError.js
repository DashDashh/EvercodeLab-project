const BaseError = require("./BaseError");
//Ошибка валидации данных
class ValidationError extends BaseError {
  constructor(message, validationErrors = [], context = {}) {
    super(message, 400, {
      ...context,
      validationErrors,
    });

    this.validationErrors = validationErrors;
  }

  getFormattedErrors() {
    if (
      !Array.isArray(this.validationErrors) ||
      this.validationErrors.length === 0
    ) {
      return [];
    }

    return this.validationErrors.map((err) => ({
      field: err.field || err.path || "unknown",
      message: err.message,
      value: err.value,
      ...(err.constraints && { constraints: err.constraints }),
    }));
  }

  addValidationError(error) {
    if (!this.validationErrors) {
      this.validationErrors = [];
    }
    this.validationErrors.push(error);
    this.context.validationErrors = this.validationErrors;
  }

  getClientResponse() {
    return {
      ...super.getClientResponse(),
      validationErrors: this.getFormattedErrors(),
    };
  }
}

module.exports = ValidationError;
