const express = require("express");

const {
  createOrder,
  confirmMockPayment,
} = require("../controllers/paymentController");

const router = express.Router();

router.post("/create-order", createOrder);
router.post("/confirm-mock", confirmMockPayment);

module.exports = router;
