const {
  BaseError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
} = require("../errors");

describe("Errors", () => {
  describe("BaseError", () => {
    test("creates error with params", () => {
      const error = new BaseError("Test", 400, { key: "value" });

      expect(error.message).toBe("Test");
      expect(error.statusCode).toBe(400);
      expect(error.context).toEqual({ key: "value" });
      expect(error.timestamp).toBeDefined();
    });

    test("toJSON returns a serializable object", () => {
      const error = new BaseError("Тест", 500);
      const json = error.toJSON();

      expect(json).toHaveProperty("name", "BaseError");
      expect(json).toHaveProperty("message", "Тест");
      expect(json).toHaveProperty("statusCode", 500);
      expect(json).toHaveProperty("stack");
    });

    test("toString returns string", () => {
      const error = new BaseError("Тест", 404);
      expect(error.toString()).toContain("BaseError: Тест");
      expect(error.toString()).toContain("404");
    });
  });

  describe("ValidationError", () => {
    test("creates validation error", () => {
      const errors = [{ field: "email", message: "Email required" }];
      const error = new ValidationError("Error", errors);

      expect(error.statusCode).toBe(400);
      expect(error.validationErrors).toEqual(errors);
    });

    test("getFormattedErrors formats errors", () => {
      const errors = [{ field: "email", message: "Email required" }];
      const error = new ValidationError("Error", errors);
      const formatted = error.getFormattedErrors();

      expect(formatted[0]).toHaveProperty("field", "email");
      expect(formatted[0]).toHaveProperty("message");
    });
  });

  describe("AuthenticationError", () => {
    test("creates authentication error with default message", () => {
      const error = new AuthenticationError();

      expect(error.statusCode).toBe(401);
      expect(error.message).toBe("Authorization is required");
      expect(error.userId).toBeNull();
      expect(error.context.requiresAuth).toBe(true);
    });

    test("creates authentication error with custom message", () => {
      const error = new AuthenticationError("The session has expired");

      expect(error.statusCode).toBe(401);
      expect(error.message).toBe("The session has expired");
      expect(error.userId).toBeNull();
    });

    test("creates authentication error with userId", () => {
      const error = new AuthenticationError("Access denied", 123);

      expect(error.userId).toBe(123);
      expect(error.context.userId).toBe(123);
    });

    test("creates authentication error with context", () => {
      const error = new AuthenticationError("Error", 123, {
        ip: "127.0.0.1",
        role: "user",
      });

      expect(error.context).toMatchObject({
        userId: 123,
        ip: "127.0.0.1",
        role: "user",
        requiresAuth: true,
      });
    });

    test("hasUserInfo returns true when userId exists", () => {
      const errorWithUser = new AuthenticationError("Error", 123);
      const errorWithoutUser = new AuthenticationError("Error");

      expect(errorWithUser.hasUserInfo()).toBe(true);
      expect(errorWithoutUser.hasUserInfo()).toBe(false);
    });

    test("getClientResponse includes userId and requiresAuth", () => {
      const error = new AuthenticationError("Access denied", 123);
      const response = error.getClientResponse();

      expect(response).toHaveProperty("error", "AuthenticationError");
      expect(response).toHaveProperty("message", "Access denied");
      expect(response).toHaveProperty("statusCode", 401);
      expect(response).toHaveProperty("requiresAuth", true);
      expect(response).toHaveProperty("userId", 123);
    });

    test("getClientResponse excludes userId when not provided", () => {
      const error = new AuthenticationError("Access denied");
      const response = error.getClientResponse();

      expect(response).toHaveProperty("requiresAuth", true);
      expect(response).not.toHaveProperty("userId");
    });
  });

  describe("NotFoundError", () => {
    test("creates error with resourceType", () => {
      const error = new NotFoundError("User");

      expect(error.statusCode).toBe(404);
      expect(error.resourceType).toBe("User");
      expect(error.message).toContain("User not found");
    });

    test("creates error with resourceId", () => {
      const error = new NotFoundError("User", 123);

      expect(error.message).toContain("123");
    });

    test("getResourceInfo returns resource info", () => {
      const error = new NotFoundError("User", 123);
      const info = error.getResourceInfo();

      expect(info).toHaveProperty("type", "User");
      expect(info).toHaveProperty("id", 123);
      expect(info).toHaveProperty("timestamp");
    });
  });
});
