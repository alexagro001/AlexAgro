const mongoose = require("mongoose");

const DistributorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    designation: { type: String, trim: true, default: "Sales Officer" },
    division: { type: String, required: true, trim: true },
    district: { type: String, trim: true },
    territory: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    link: { type: String, trim: true }, // clicking the map pin redirects here
    photo: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

DistributorSchema.index({ name: "text", division: "text", district: "text", territory: "text" });

module.exports = mongoose.model("Distributor", DistributorSchema);
