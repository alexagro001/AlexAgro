const mongoose = require("mongoose");

const BannerSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    subtitle: { type: String, trim: true },
    image: { type: String, required: true, trim: true },
    link: { type: String, trim: true }, // optional: makes the slide clickable
    order: { type: Number, default: 0 }, // lower numbers show first
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", BannerSchema);
