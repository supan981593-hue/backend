const bcrypt = require("bcryptjs");

const User = require("../models/User");

async function seedShopkeeper() {
  const email = process.env.SHOPKEEPER_EMAIL;
  const password = process.env.SHOPKEEPER_PASSWORD;
  const name = process.env.SHOPKEEPER_NAME || "Shopkeeper";

  if (!email || !password) {
    return;
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    const passwordMatches = await bcrypt.compare(password, existingUser.passwordHash);

    if (!passwordMatches) {
      existingUser.passwordHash = await bcrypt.hash(password, 10);
      existingUser.name = name;
      await existingUser.save();
      console.log("Default shopkeeper password updated from environment");
    }

    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: "shopkeeper",
  });

  console.log("Default shopkeeper user created");
}

module.exports = seedShopkeeper;
