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

try {
  const swaggerUi = require("swagger-ui-express");
  const YAML = require("yamljs");
  const swaggerDocument = YAML.load("./openapi.yaml");
  router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {}

module.exports = router;
