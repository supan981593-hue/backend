const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const printJobRoutes = require("./routes/printJobRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const { ensureUploadsDir, uploadsDir } = require("./config/paths");

const app = express();

ensureUploadsDir();

app.use(cors());
app.use(morgan("dev"));
app.use("/uploads", express.static(uploadsDir));

// JSON body parsing is enabled for normal REST endpoints.
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/print-jobs", printJobRoutes);
app.use("/api/payments", paymentRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);

  res.status(err.statusCode || 500).json({
    message: err.message || "Internal server error",
  });
});

module.exports = app;
