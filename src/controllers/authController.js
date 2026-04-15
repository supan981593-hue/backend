const bcrypt = require("bcryptjs");

const User = require("../models/User");
const signToken = require("../utils/signToken");

async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email: String(email).toLowerCase() });

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = signToken(user);

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}

module.exports = {
  login,
};
