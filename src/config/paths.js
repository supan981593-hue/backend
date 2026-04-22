const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..", "..");
const uploadsDir = path.join(projectRoot, "uploads");

function ensureUploadsDir() {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

module.exports = {
  projectRoot,
  uploadsDir,
  ensureUploadsDir,
};
