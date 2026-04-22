const PrintJob = require("../models/PrintJob");
const calculateAmount = require("../utils/calculateAmount");
const isDbReady = require("../utils/isDbReady");

async function createOrder(req, res) {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        message: "Database is not connected yet. Please try again in a moment.",
      });
    }

    const { printJobId } = req.body;
    const printJob = await PrintJob.findById(printJobId);

    if (!printJob) {
      return res.status(404).json({ message: "Print job not found" });
    }

    const amount = calculateAmount(printJob.pages, printJob.copies);
    const orderId = `test_order_${printJob._id}`;
    const qrPayload = `upi://pay?pa=testshop@upi&pn=PrintShop&am=${(amount / 100).toStringAsFixed(2)}&cu=INR&tn=PrintJob-${printJob._id}`;

    printJob.amount = amount;
    printJob.currency = "INR";
    await printJob.save();

    res.json({
      orderId,
      amount,
      currency: "INR",
      qrPayload,
      printJobId: printJob._id,
    });
  } catch (error) {
    console.error("Failed to create QR payment order", error);
    res.status(500).json({ message: "Failed to create QR payment order" });
  }
}

async function confirmMockPayment(req, res) {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        message: "Database is not connected yet. Please try again in a moment.",
      });
    }

    const { printJobId } = req.body;
    const printJob = await PrintJob.findById(printJobId);

    if (!printJob) {
      return res.status(404).json({ message: "Print job not found" });
    }

    printJob.paymentStatus = "paid";
    await printJob.save();

    res.json({
      message: "Mock QR payment confirmed",
      printJob,
    });
  } catch (error) {
    console.error("Failed to confirm mock payment", error);
    res.status(500).json({ message: "Failed to confirm mock payment" });
  }
}

module.exports = {
  createOrder,
  confirmMockPayment,
};
