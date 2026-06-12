const express = require("express");
const statusRoutes = require("./statusRoutes");
const healthRoutes = require("./healthRoutes");
const currencyRoutes = require("./currencyRoutes");
const priceRoutes = require("./priceRoutes");

const router = express.Router();

router.use("/status", statusRoutes);
router.use("/health", healthRoutes);

router.use("/api/currencies", currencyRoutes);
router.use("/price", priceRoutes);

module.exports = router;
