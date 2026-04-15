const express = require("express");

const {
  uploadPrintJob,
  getPrintJobs,
  getPrintJobById,
} = require("../controllers/printJobController");
const requireAuth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/upload", upload.single("file"), uploadPrintJob);
router.get("/", requireAuth, getPrintJobs);
router.get("/:id", requireAuth, getPrintJobById);

module.exports = router;
