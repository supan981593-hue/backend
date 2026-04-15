const crypto = require("crypto");

function createHmacSignature(content, secret) {
  return crypto.createHmac("sha256", secret).update(content).digest("hex");
}

module.exports = createHmacSignature;
