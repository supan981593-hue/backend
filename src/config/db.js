const mongoose = require("mongoose");

async function connectDb() {
  const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;

  if (!mongoUri) {
    throw new Error("MONGODB_URI or DATABASE_URL is required");
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log("MongoDB connected");
}

module.exports = connectDb;
