const request = require("supertest");
const app = require("../app");
const config = require("../config");
const CurrencyRepository = require("../services/repositories/CurrencyRepository");

describe("Price Endpoint", () => {
  let authToken;

  beforeAll(async () => {
    authToken = config.apiToken;
  });

  beforeEach(async () => {
    const db = await CurrencyRepository.getDb();
    await db.run("DELETE FROM currencies");
    await db.run('DELETE FROM sqlite_sequence WHERE name="currencies"');
  });

  afterAll(async () => {
    await CurrencyRepository.close();
  });

  test("GET /price - должен вернуть 401 без токена", async () => {
    await request(app).get("/price?currency=BTC").expect(401);
  });

  test("GET /price - должен вернуть 400 если параметр currency отсутствует", async () => {
    const response = await request(app)
      .get("/price")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("currency");
  });

  test("GET /price - должен вернуть 404 если валюта не найдена в БД", async () => {
    const response = await request(app)
      .get("/price?currency=XXX")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("не найдена");
  });

  test("GET /price - должен вернуть курсы для существующей валюты BTC", async () => {
    await request(app)
      .post("/api/currencies")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Bitcoin", ticker: "BTC" })
      .expect(201);

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
  });

  test("GET /price - должен работать с параметром currency в нижнем регистре", async () => {
    await request(app)
      .post("/api/currencies")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Bitcoin", ticker: "BTC" })
      .expect(201);

    const response = await request(app)
      .get("/price?currency=btc")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.data.currency).toBe("BTC");
  });

  test("GET /price - должен возвращать ответ быстро (менее 5 секунд)", async () => {
    await request(app)
      .post("/api/currencies")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Bitcoin", ticker: "BTC" })
      .expect(201);

    const startTime = Date.now();
    await request(app)
      .get("/price?currency=BTC")
      .set("Authorization", `Bearer ${authToken}`);
    const endTime = Date.now();

    expect(endTime - startTime).toBeLessThan(5000);
  });

  test("GET /price/all - должен вернуть список всех доступных валют из Binance", async () => {
    const response = await request(app)
      .get("/price/all")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty("currencies");
    expect(response.body.data).toHaveProperty("total");
    expect(Array.isArray(response.body.data.currencies)).toBe(true);
    expect(response.body.data.currencies.length).toBeGreaterThan(0);
  });

  test("GET /price/all - должен вернуть 401 без токена", async () => {
    await request(app).get("/price/all").expect(401);
  });
});
