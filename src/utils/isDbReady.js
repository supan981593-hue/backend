const mongoose = require("mongoose");

function isDbReady() {
  return mongoose.connection.readyState === 1;
}

module.exports = isDbReady;
