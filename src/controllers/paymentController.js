const PrintJob = require("../models/PrintJob");
const razorpay = require("../config/razorpay");
const calculateAmount = require("../utils/calculateAmount");
const createHmacSignature = require("../utils/verifySignature");

async function createOrder(req, res) {
  const { printJobId } = req.body;
  const printJob = await PrintJob.findById(printJobId);

  if (!printJob) {
    return res.status(404).json({ message: "Print job not found" });
  }

  const amount = calculateAmount(printJob.pages, printJob.copies);

  const order = await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt: `printjob_${printJob._id}`,
    notes: {
      printJobId: printJob._id.toString(),
      customerName: printJob.customerName,
    },
  });

  printJob.amount = amount;
  printJob.currency = order.currency;
  printJob.razorpayOrderId = order.id;
  await printJob.save();

  res.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    printJobId: printJob._id,
  });
}

async function verifyPayment(req, res) {
  const { printJobId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const printJob = await PrintJob.findById(printJobId);

  if (!printJob) {
    return res.status(404).json({ message: "Print job not found" });
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = createHmacSignature(body, process.env.RAZORPAY_KEY_SECRET);

  if (expectedSignature !== razorpay_signature) {
    printJob.paymentStatus = "failed";
    await printJob.save();
    return res.status(400).json({ message: "Invalid payment signature" });
  }

  printJob.paymentStatus = "paid";
  printJob.razorpayOrderId = razorpay_order_id;
  printJob.razorpayPaymentId = razorpay_payment_id;
  printJob.razorpaySignature = razorpay_signature;
  await printJob.save();

  res.json({ message: "Payment verified", printJob });
}

async function handleWebhook(req, res) {
  const rawBody = req.body;
  const signature = req.headers["x-razorpay-signature"];
  const expectedSignature = createHmacSignature(
    rawBody,
    process.env.RAZORPAY_WEBHOOK_SECRET
  );

  if (expectedSignature !== signature) {
    return res.status(400).json({ message: "Invalid webhook signature" });
  }

  const payload = JSON.parse(rawBody.toString("utf8"));
  const event = payload.event;
  const paymentEntity = payload.payload?.payment?.entity;
  const orderEntity = payload.payload?.order?.entity;
  const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;

  const printJob = await PrintJob.findOne({ razorpayOrderId });

  if (printJob) {
    if (event === "payment.captured" || event === "order.paid") {
      printJob.paymentStatus = "paid";
    }

    if (event === "payment.failed") {
      printJob.paymentStatus = "failed";
    }

    if (paymentEntity?.id) {
      printJob.razorpayPaymentId = paymentEntity.id;
    }

    await printJob.save();
  }

  res.json({ received: true });
}

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook,
};
