const BaseError = require("./BaseError");
const ValidationError = require("./ValidationError");
const AuthenticationError = require("./AuthenticationError");
const NotFoundError = require("./NotFoundError");

module.exports = {
  BaseError,
  ValidationError,
  AuthenticationError,
  NotFoundError,

  isBaseError: (error) => error instanceof BaseError,

  createError: (type, ...args) => {
    const ErrorClass = {
      validation: ValidationError,
      auth: AuthenticationError,
      notFound: NotFoundError,
    }[type];

    if (!ErrorClass) {
      throw new Error(`Unknown error type: ${type}`);
    }

    return new ErrorClass(...args);
  },
};
