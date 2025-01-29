const mongoose = require("mongoose");

const SqlQuerySchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
  },
  sqlContent: {
    type: String,
    required: true,
  },
  analysisResults: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("SqlQuery", SqlQuerySchema);
