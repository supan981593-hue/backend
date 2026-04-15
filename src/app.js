const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const printJobRoutes = require("./routes/printJobRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const { handleWebhook } = require("./controllers/paymentController");

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Razorpay webhook verification needs the raw request body.
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

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
