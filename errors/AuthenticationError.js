const BaseError = require("./BaseError");
//Ошибка аутентификации
class AuthenticationError extends BaseError {
  constructor(
    message = "Authorization is required",
    userId = null,
    context = {},
  ) {
    super(message, 401, {
      ...context,
      userId,
      requiresAuth: true,
    });

    this.userId = userId;
  }

  hasUserInfo() {
    return !!this.userId;
  }

  getClientResponse() {
    return {
      ...super.getClientResponse(),
      requiresAuth: true,
      ...(this.hasUserInfo() && { userId: this.userId }),
    };
  }
}

module.exports = AuthenticationError;
