const mongoose = require("mongoose");

const CareerApplicationSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    cvUrl: { type: String, required: true, trim: true },
    cvFilename: { type: String, trim: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CareerApplication", CareerApplicationSchema);
