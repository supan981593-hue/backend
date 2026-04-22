require("dotenv").config();

const app = require("./app");
const connectDb = require("./config/db");
const seedShopkeeper = require("./utils/seedShopkeeper");

const PORT = process.env.PORT || 5000;
const DB_RETRY_DELAY_MS = 5000;

async function connectWithRetry() {
  try {
    await connectDb();
    await seedShopkeeper();
  } catch (error) {
    console.error("Database startup failed. Retrying in 5 seconds.", error);
    setTimeout(connectWithRetry, DB_RETRY_DELAY_MS);
  }
}

function startServer() {
  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });

  connectWithRetry();
}

try {
  startServer();
} catch (error) {
  console.error("Failed to start server", error);
  process.exit(1);
}
