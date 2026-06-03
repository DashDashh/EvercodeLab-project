const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const currencyService = require("../services/currencyDbService");
const { logger } = require("../utils/logger");

const router = express.Router();

router.use(authenticateToken);

router.get("/", async (req, res, next) => {
  try {
    const currencies = await currencyService.getAll();
    res.status(200).json({
      success: true,
      data: currencies,
      count: currencies.length,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const currency = await currencyService.getById(req.params.id);
    if (!currency) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: `Валюта с id ${req.params.id} не найдена`,
      });
    }
    res.status(200).json({ success: true, data: currency });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, ticker } = req.body;

    if (!name || !ticker) {
      return res.status(400).json({
        success: false,
        message: "name и ticker обязательны",
      });
    }

    const exists = await currencyService.existsByTicker(ticker);
    if (exists) {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "Тикер уже существует",
      });
    }

    const currency = await currencyService.create(name, ticker);
    res.status(201).json({ success: true, data: currency });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { name, ticker } = req.body;
    const currency = await currencyService.update(req.params.id, name, ticker);

    if (!currency) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: `Валюта с id ${req.params.id} не найдена`,
      });
    }

    res.status(200).json({ success: true, data: currency });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const deleted = await currencyService.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: `Валюта с id ${req.params.id} не найдена`,
      });
    }
    res.status(200).json({
      success: true,
      message: "Валюта удалена",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
