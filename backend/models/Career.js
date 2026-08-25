const mongoose = require("mongoose");

const CareerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    employmentType: { type: String, trim: true, default: "Full-time" },
    description: { type: String, trim: true },
    deadline: { type: Date },
    applyLink: { type: String, trim: true }, // mailto: or external application form
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Career", CareerSchema);
