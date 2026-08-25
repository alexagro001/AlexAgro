const mongoose = require("mongoose");

const DealerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    division: { type: String, required: true, trim: true }, // e.g. Dhaka, Chattogram
    district: { type: String, trim: true },
    area: { type: String, trim: true }, // upazila / locality
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    lat: { type: Number, required: true }, // map pin latitude
    lng: { type: Number, required: true }, // map pin longitude
    link: { type: String, trim: true }, // clicking the map pin redirects here (dealer profile / whatsapp / facebook / website)
    photo: { type: String, trim: true }, // image URL
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

DealerSchema.index({ name: "text", division: "text", district: "text", area: "text" });

module.exports = mongoose.model("Dealer", DealerSchema);
