const path = require("path");

const PrintJob = require("../models/PrintJob");
const isDbReady = require("../utils/isDbReady");

async function uploadPrintJob(req, res) {
  try {
    const { customerName, pages, copies, notes } = req.body;

    if (!isDbReady()) {
      return res.status(503).json({
        message: "Database is not connected yet. Please try again in a moment.",
      });
    }

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
  } catch (error) {
    console.error("Failed to upload print job", error);
    res.status(500).json({ message: "Failed to upload print job" });
  }
}

async function getPrintJobs(req, res) {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        message: "Database is not connected yet. Please try again in a moment.",
      });
    }

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
  } catch (error) {
    console.error("Failed to load print jobs", error);
    res.status(500).json({ message: "Failed to load print jobs" });
  }
}

async function getPrintJobById(req, res) {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        message: "Database is not connected yet. Please try again in a moment.",
      });
    }

    const printJob = await PrintJob.findById(req.params.id);

    if (!printJob) {
      return res.status(404).json({ message: "Print job not found" });
    }

    res.json(printJob);
  } catch (error) {
    console.error("Failed to load print job", error);
    res.status(500).json({ message: "Failed to load print job" });
  }
}

module.exports = {
  uploadPrintJob,
  getPrintJobs,
  getPrintJobById,
};
