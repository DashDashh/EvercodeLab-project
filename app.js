const express = require("express");
const config = require("./config");
const { requestLogger } = require("./middleware/logger");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(express.json());
app.use(requestLogger);

const statusRoutes = require("./routes/statusRoutes");
const healthRoutes = require("./routes/healthRoutes");
const currencyRoutes = require("./routes/currencyRoutes");
const priceRoutes = require("./routes/priceRoutes");
const currencyService = require("./services/currencyService");

app.use("/status", statusRoutes);
app.use("/health", healthRoutes);
app.use("/api/currencies", currencyRoutes);
app.use("/price", priceRoutes);

app.use(errorHandler);

module.exports = app;
