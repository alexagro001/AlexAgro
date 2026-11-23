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
    altText: { type: String, trim: true, maxlength: 300 }, // SEO alt text for the product image
    detailsLink: { type: String, trim: true },
    // ---- SEO fields (used for the product's own page, Google title/description and structured data) ----
    slug: { type: String, trim: true, lowercase: true, index: { unique: true, sparse: true } }, // page address: /products/<slug>
    brand: { type: String, trim: true, default: "Alex Agro" },
    sku: { type: String, trim: true }, // optional product code
    seoTitle: { type: String, trim: true, maxlength: 70 },
    seoTitleBn: { type: String, trim: true, maxlength: 70 },
    metaDescription: { type: String, trim: true, maxlength: 200 },
    metaDescriptionBn: { type: String, trim: true, maxlength: 200 },
    keywords: { type: String, trim: true, maxlength: 300 }, // comma-separated: synonyms & spelling variants (English)
    keywordsBn: { type: String, trim: true, maxlength: 300 }, // comma-separated (বাংলা)
    altTextBn: { type: String, trim: true, maxlength: 300 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
