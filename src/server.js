require("dotenv").config();

const app = require("./app");
const connectDb = require("./config/db");
const seedShopkeeper = require("./utils/seedShopkeeper");

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDb();
  await seedShopkeeper();

  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
