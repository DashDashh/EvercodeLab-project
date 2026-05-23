const request = require("supertest");
const { app } = require("../app");

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
    test("must return JSON with app status", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.body).toHaveProperty("status", "ok");
      expect(response.body).toHaveProperty("appName");
      expect(response.body).toHaveProperty("environment");
      expect(response.body).toHaveProperty("version");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("activeTasks");
    });
  });
});
