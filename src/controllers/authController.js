const bcrypt = require("bcryptjs");

const User = require("../models/User");
const isDbReady = require("../utils/isDbReady");
const signToken = require("../utils/signToken");

async function login(req, res) {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!isDbReady()) {
      return res.status(503).json({
        message: "Database is not connected yet. Please try again in a moment.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.json({
      token: signToken(user),
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login failed", error);
    return res.status(500).json({ message: "Login failed" });
  }
}

async function getCurrentUser(req, res) {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        message: "Database is not connected yet. Please try again in a moment.",
      });
    }

    const user = await User.findById(req.user.sub).select("name email role");

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    return res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Failed to load current user", error);
    return res.status(500).json({ message: "Failed to load current user" });
  }
}

module.exports = {
  getCurrentUser,
  login,
};
