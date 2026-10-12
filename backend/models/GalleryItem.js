const mongoose = require("mongoose");

const GalleryItemSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, enum: ["photo", "video"] },
    title: { type: String, required: true, trim: true },
    titleBn: { type: String, trim: true }, // optional Bangla title; falls back to `title` if blank
    description: { type: String, trim: true },
    descriptionBn: { type: String, trim: true },
    url: { type: String, required: true, trim: true }, // image URL, or video URL/embed (e.g. YouTube link)
    thumbnail: { type: String, trim: true }, // used for videos
    order: { type: Number, default: 0 }, // lower numbers show first; controls display sequence
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GalleryItem", GalleryItemSchema);
