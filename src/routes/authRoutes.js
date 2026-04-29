const express = require("express");

const { getCurrentUser, login } = require("../controllers/authController");
const requireAuth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.get("/me", requireAuth, getCurrentUser);

module.exports = router;
