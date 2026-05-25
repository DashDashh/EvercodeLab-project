const request = require("supertest");
const { app } = require("../app");
const config = require("../config");

describe("Price Endpoint", () => {
  let authToken;
  let createdCurrencyId;

  beforeAll(async () => {
    authToken = config.apiToken;

    const createResponse = await request(app)
      .post("/api/currencies")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Bitcoin",
        ticker: "BTC",
      });

    if (createResponse.status === 201) {
      createdCurrencyId = createResponse.body.data.id;
    }
  });

  describe("GET /price", () => {
    test("должен вернуть 401 без токена", async () => {
      await request(app).get("/price?currency=BTC").expect(401);
    });

    test("должен вернуть 400 если параметр currency отсутствует", async () => {
      const response = await request(app)
        .get("/price")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("currency");
    });

    test("должен вернуть 404 если валюта не найдена в БД", async () => {
      const response = await request(app)
        .get("/price?currency=XXX")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("не найдена в базе данных");
    });

    test("должен вернуть курсы для существующей валюты BTC", async () => {
      const response = await request(app)
        .get("/price?currency=BTC")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.currency).toBe("BTC");
      expect(response.body.data.source).toBe("Binance API");
      expect(response.body.data).toHaveProperty("totalPairs");
      expect(response.body.data).toHaveProperty("pairs");
      expect(Array.isArray(response.body.data.pairs)).toBe(true);

      if (response.body.data.pairs.length > 0) {
        expect(response.body.data.pairs[0]).toHaveProperty("symbol");
        expect(response.body.data.pairs[0]).toHaveProperty("price");
      }
    });

    test("должен работать с параметром currency в нижнем регистре", async () => {
      const response = await request(app)
        .get("/price?currency=btc")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.currency).toBe("BTC");
    });

    test("должен возвращать ответ быстро (менее 5 секунд)", async () => {
      const startTime = Date.now();
      await request(app)
        .get("/price?currency=BTC")
        .set("Authorization", `Bearer ${authToken}`);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000);
    });
  });

  describe("GET /price/all", () => {
    test("должен вернуть список всех доступных валют из Binance", async () => {
      const response = await request(app)
        .get("/price/all")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("currencies");
      expect(response.body.data).toHaveProperty("total");
      expect(Array.isArray(response.body.data.currencies)).toBe(true);
      expect(response.body.data.currencies).toContain("BTC");
    });

    test("должен вернуть 401 без токена", async () => {
      await request(app).get("/price/all").expect(401);
    });
  });
});
