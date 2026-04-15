const path = require("path");

const PrintJob = require("../models/PrintJob");

async function uploadPrintJob(req, res) {
  const { customerName, pages, copies, notes } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "File is required" });
  }

  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

  const printJob = await PrintJob.create({
    customerName,
    pages: Number(pages),
    copies: Number(copies),
    notes,
    fileUrl,
    fileName: req.file.originalname,
    fileStoragePath: path.join("uploads", req.file.filename),
  });

  res.status(201).json(printJob);
}

async function getPrintJobs(req, res) {
  const { paymentStatus, startDate, endDate } = req.query;
  const query = {};

  if (paymentStatus && paymentStatus !== "all") {
    query.paymentStatus = paymentStatus;
  }

  if (startDate || endDate) {
    query.createdAt = {};
  }

  if (startDate) {
    query.createdAt.$gte = new Date(startDate);
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    query.createdAt.$lte = end;
  }

  const printJobs = await PrintJob.find(query).sort({ createdAt: -1 });
  res.json(printJobs);
}

async function getPrintJobById(req, res) {
  const printJob = await PrintJob.findById(req.params.id);

  if (!printJob) {
    return res.status(404).json({ message: "Print job not found" });
  }

  res.json(printJob);
}

module.exports = {
  uploadPrintJob,
  getPrintJobs,
  getPrintJobById,
};
