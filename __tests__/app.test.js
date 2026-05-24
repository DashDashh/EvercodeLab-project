const request = require("supertest");
const { app } = require("../app");
const config = require("../config");

describe("Express App", () => {
  describe("GET /status", () => {
    test('must return status 200 and string "ok"', async () => {
      const response = await request(app).get("/status").expect(200);

      expect(response.text).toBe("ok");
    });

    test("must answer fast (for monitoring)", async () => {
      const startTime = Date.now();
      await request(app).get("/status");
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe("GET /health", () => {
    test("must return 401 without token", async () => {
      await request(app).get("/health").expect(401);
    });

    test("must return 403 with invalid token", async () => {
      await request(app)
        .get("/health")
        .set("Authorization", "Bearer invalid_token_123")
        .expect(403);
    });

    test("must return JSON with app status with valid token", async () => {
      if (!config.apiToken) {
        console.warn("API_TOKEN not set in .env, skipping test");
        return;
      }

      const response = await request(app)
        .get("/health")
        .set("Authorization", `Bearer ${config.apiToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("status", "ok");
      expect(response.body).toHaveProperty("appName");
      expect(response.body).toHaveProperty("environment");
      expect(response.body).toHaveProperty("version");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("activeTasks");
    });
  });
});
