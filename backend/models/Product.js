const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    nameBn: { type: String, trim: true }, // optional Bangla name; falls back to `name` if blank
    category: {
      type: String,
      required: true,
      enum: ["crop-health", "agro-processing"],
    },
    shortDescription: { type: String, trim: true },
    shortDescriptionBn: { type: String, trim: true },
    description: { type: String, trim: true },
    descriptionBn: { type: String, trim: true },
    image: { type: String, trim: true },
    detailsLink: { type: String, trim: true },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
