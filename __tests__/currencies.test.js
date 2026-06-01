const request = require("supertest");
const { app } = require("../app");
const config = require("../config");
const currencyService = require("../services/currencyDbService");

describe("Currencies CRUD API", () => {
  let authToken;
  let createdCurrencyId;

  beforeAll(async () => {
    authToken = config.apiToken;

    const db = await currencyService.getDb();
    await db.run("DELETE FROM currencies");
    await db.run('DELETE FROM sqlite_sequence WHERE name="currencies"');
  });

  afterAll(async () => {
    await currencyService.close();
  });

  describe("POST /api/currencies", () => {
    test("должен создать валюту с валидными данными", async () => {
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

      createdCurrencyId = response.body.data.id;
      console.log(`Created currency with ID: ${createdCurrencyId}`);
    });

    test("должен вернуть 409 при дубликате ticker", async () => {
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
  });

  describe("GET /api/currencies", () => {
    test("должен вернуть список всех валют", async () => {
      const response = await request(app)
        .get("/api/currencies")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe("Bitcoin");
    });
  });

  describe("GET /api/currencies/:id", () => {
    test("должен вернуть валюту по id", async () => {
      expect(createdCurrencyId).toBeDefined();

      const response = await request(app)
        .get(`/api/currencies/${createdCurrencyId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.id).toBe(createdCurrencyId);
      expect(response.body.data.name).toBe("Bitcoin");
    });

    test("должен вернуть 404 для несуществующего id", async () => {
      await request(app)
        .get("/api/currencies/99999")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe("PUT /api/currencies/:id", () => {
    test("должен обновить валюту", async () => {
      expect(createdCurrencyId).toBeDefined();

      const response = await request(app)
        .put(`/api/currencies/${createdCurrencyId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "Bitcoin Updated" })
        .expect(200);

      expect(response.body.data.name).toBe("Bitcoin Updated");
    });
  });

  describe("DELETE /api/currencies/:id", () => {
    test("должен удалить валюту", async () => {
      const createResponse = await request(app)
        .post("/api/currencies")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "To Delete", ticker: "DEL" })
        .expect(201);

      const deleteId = createResponse.body.data.id;
      expect(deleteId).toBeDefined();

      await request(app)
        .delete(`/api/currencies/${deleteId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      await request(app)
        .get(`/api/currencies/${deleteId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
