const express = require("express");

const {
  uploadPrintJob,
  getPrintJobs,
  getPrintJobById,
} = require("../controllers/printJobController");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/upload", upload.single("file"), uploadPrintJob);
router.get("/", getPrintJobs);
router.get("/:id", getPrintJobById);

module.exports = router;
