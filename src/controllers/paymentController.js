const PrintJob = require("../models/PrintJob");
const calculateAmount = require("../utils/calculateAmount");

async function createOrder(req, res) {
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
}

async function confirmMockPayment(req, res) {
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
}

module.exports = {
  createOrder,
  confirmMockPayment,
};
