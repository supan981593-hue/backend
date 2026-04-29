const path = require("path");

const PrintJob = require("../models/PrintJob");
const isDbReady = require("../utils/isDbReady");

function getPublicBaseUrl(req) {
  if (process.env.BASE_URL) {
    return process.env.BASE_URL.replace(/\/$/, "");
  }

  const protocol = req.get("x-forwarded-proto") || req.protocol || "http";
  return `${protocol}://${req.get("host")}`;
}

function normalizePrintJob(printJob, req) {
  const normalizedJob = typeof printJob.toObject === "function" ? printJob.toObject() : printJob;
  const baseUrl = getPublicBaseUrl(req);

  if (normalizedJob.fileStoragePath) {
    normalizedJob.fileUrl = `${baseUrl}/${normalizedJob.fileStoragePath.replace(/\\/g, "/")}`;
  } else if (normalizedJob.fileUrl) {
    try {
      const fileUrl = new URL(normalizedJob.fileUrl);
      normalizedJob.fileUrl = `${baseUrl}${fileUrl.pathname}`;
    } catch (_error) {
      const fileName = path.basename(normalizedJob.fileUrl);
      normalizedJob.fileUrl = `${baseUrl}/uploads/${fileName}`;
    }
  } else if (normalizedJob.fileStoragePath) {
    normalizedJob.fileUrl = `${baseUrl}/${normalizedJob.fileStoragePath.replace(/\\/g, "/")}`;
  }

  return normalizedJob;
}

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

    const baseUrl = getPublicBaseUrl(req);
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

    res.status(201).json(normalizePrintJob(printJob, req));
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
    res.json(printJobs.map((printJob) => normalizePrintJob(printJob, req)));
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

    res.json(normalizePrintJob(printJob, req));
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
