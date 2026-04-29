const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const printJobRoutes = require("./routes/printJobRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const { ensureUploadsDir, uploadsDir } = require("./config/paths");

const app = express();

ensureUploadsDir();

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://tiny-pond-4371.supan981593.workers.dev",
];

const corsOptions = {
  origin(origin, callback) {
    const origins = allowedOrigins.length ? allowedOrigins : defaultAllowedOrigins;

    if (!origin || origins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(morgan("dev"));
app.use("/uploads", express.static(uploadsDir));

// JSON body parsing is enabled for normal REST endpoints.
app.use(express.json());

app.get("/api/health", (_req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? "ok" : "degraded",
    dbConnected,
  });
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
