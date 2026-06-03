const request = require("supertest");
const app = require("../app");
const config = require("../config");
const CurrencyRepository = require("../services/repositories/CurrencyRepository");

describe("Currencies CRUD API", () => {
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

  test("POST /api/currencies - должен создать валюту с валидными данными", async () => {
    const response = await request(app)
      .post("/api/currencies")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Bitcoin",
        ticker: "BTC",
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty("id");
    expect(response.body.data.name).toBe("Bitcoin");
    expect(response.body.data.ticker).toBe("BTC");
  });

  test("POST /api/currencies - должен вернуть 409 при дубликате ticker", async () => {
    await request(app)
      .post("/api/currencies")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Bitcoin",
        ticker: "BTC",
      })
      .expect(201);

    const response = await request(app)
      .post("/api/currencies")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Bitcoin Cash",
        ticker: "BTC",
      })
      .expect(409);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Conflict");
  });

  test("GET /api/currencies - должен вернуть список всех валют", async () => {
    await request(app)
      .post("/api/currencies")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Bitcoin", ticker: "BTC" })
      .expect(201);

    await request(app)
      .post("/api/currencies")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Ethereum", ticker: "ETH" })
      .expect(201);

    const response = await request(app)
      .get("/api/currencies")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(2);
  });

  test("GET /api/currencies/:id - должен вернуть валюту по id", async () => {
    const createResponse = await request(app)
      .post("/api/currencies")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Bitcoin", ticker: "BTC" })
      .expect(201);

    const currencyId = createResponse.body.data.id;

    const response = await request(app)
      .get(`/api/currencies/${currencyId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.data.id).toBe(currencyId);
    expect(response.body.data.name).toBe("Bitcoin");
  });

  test("GET /api/currencies/:id - должен вернуть 404 для несуществующего id", async () => {
    await request(app)
      .get("/api/currencies/99999")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(404);
  });

  test("PUT /api/currencies/:id - должен обновить валюту", async () => {
    const createResponse = await request(app)
      .post("/api/currencies")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Bitcoin", ticker: "BTC" })
      .expect(201);

    const currencyId = createResponse.body.data.id;

    const response = await request(app)
      .put(`/api/currencies/${currencyId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Bitcoin Updated" })
      .expect(200);

    expect(response.body.data.name).toBe("Bitcoin Updated");
  });

  test("DELETE /api/currencies/:id - должен удалить валюту", async () => {
    const createResponse = await request(app)
      .post("/api/currencies")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "To Delete", ticker: "DEL" })
      .expect(201);

    const deleteId = createResponse.body.data.id;
    expect(deleteId).toBeDefined();

    const deleteResponse = await request(app)
      .delete(`/api/currencies/${deleteId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(deleteResponse.body.success).toBe(true);
    expect(deleteResponse.body.message).toBe("Валюта удалена");

    await request(app)
      .get(`/api/currencies/${deleteId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(404);
  });
});
