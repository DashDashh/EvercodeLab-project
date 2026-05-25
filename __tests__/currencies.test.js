const request = require("supertest");
const { app } = require("../app");
const config = require("../config");

describe("Currencies CRUD API", () => {
  let authToken;
  let createdCurrencyId;

  beforeAll(() => {
    authToken = config.apiToken;
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
      expect(response.body.data).toHaveProperty("createdAt");
      expect(response.body.data).toHaveProperty("updatedAt");

      createdCurrencyId = response.body.data.id;
    });

    test("должен вернуть 400 если name отсутствует", async () => {
      const response = await request(app)
        .post("/api/currencies")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ ticker: "ETH" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("name и ticker обязательны");
    });

    test("должен вернуть 400 если ticker отсутствует", async () => {
      const response = await request(app)
        .post("/api/currencies")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "Ethereum" })
        .expect(400);

      expect(response.body.success).toBe(false);
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

    test("должен вернуть 401 без токена", async () => {
      await request(app)
        .post("/api/currencies")
        .send({ name: "Test", ticker: "TST" })
        .expect(401);
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
      expect(response.body).toHaveProperty("count");
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test("должен вернуть 401 без токена", async () => {
      await request(app).get("/api/currencies").expect(401);
    });
  });

  describe("GET /api/currencies/:id", () => {
    test("должен вернуть валюту по id", async () => {
      const response = await request(app)
        .get(`/api/currencies/${createdCurrencyId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdCurrencyId);
      expect(response.body.data.name).toBe("Bitcoin");
      expect(response.body.data.ticker).toBe("BTC");
    });

    test("должен вернуть 404 для несуществующего id", async () => {
      const response = await request(app)
        .get("/api/currencies/99999")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Not Found");
    });
  });

  describe("PUT /api/currencies/:id", () => {
    test("должен обновить name валюты", async () => {
      const response = await request(app)
        .put(`/api/currencies/${createdCurrencyId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "Bitcoin Updated" })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe("Bitcoin Updated");
      expect(response.body.data.ticker).toBe("BTC");
    });

    test("должен обновить ticker валюты", async () => {
      const response = await request(app)
        .put(`/api/currencies/${createdCurrencyId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ ticker: "BTCU" })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.ticker).toBe("BTCU");
    });

    test("должен вернуть 404 для несуществующего id", async () => {
      const response = await request(app)
        .put("/api/currencies/99999")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "Test" })
        .expect(404);

      expect(response.body.success).toBe(false);
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

      const deleteResponse = await request(app)
        .delete(`/api/currencies/${deleteId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);
      expect(deleteResponse.body.message).toContain("успешно удалена");

      await request(app)
        .get(`/api/currencies/${deleteId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });

    test("должен вернуть 404 при удалении несуществующей валюты", async () => {
      const response = await request(app)
        .delete("/api/currencies/99999")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
