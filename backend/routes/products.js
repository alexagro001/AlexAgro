const express = require("express");
const Product = require("../models/Product");
const { requireAuth } = require("../middleware/auth");
const demoData = require("../demoData");
const mongoose = require("mongoose");
const { uniqueSlug, slugSourceFor } = require("../utils/slug");

const router = express.Router();

function missingImageAltText(payload) {
  return Boolean(payload.image?.trim()) && !payload.altText?.trim();
}

// GET /api/products?category=crop-health
router.get("/", async (req, res) => {
  try {
    if (process.env.MONGO_URI && require("mongoose").connection.readyState === 1) {
      const { category, active } = req.query;
      const filter = {};
      if (active !== "all") filter.isActive = true;
      if (category) filter.category = category;

      const products = await Product.find(filter).sort({ createdAt: -1 });
      return res.json(products);
    }

    const { category } = req.query;
    const products = demoData.products.filter((product) => {
      if (category && product.category !== category) return false;
      return true;
    });
    return res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
});

// GET /api/products/<id or slug>  (e.g. /api/products/alex-zinc-mono)
router.get("/:id", async (req, res) => {
  try {
    if (!(process.env.MONGO_URI && mongoose.connection.readyState === 1)) {
      const demo = demoData.products.find((p) => p._id === req.params.id || p.slug === req.params.id);
      if (!demo) return res.status(404).json({ message: "Product not found" });
      return res.json(demo);
    }
    const product = mongoose.isValidObjectId(req.params.id)
      ? await Product.findById(req.params.id)
      : await Product.findOne({ slug: req.params.id.toLowerCase() });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch product", error: err.message });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    if (missingImageAltText(req.body)) {
      return res.status(400).json({ message: "Alt text is required for product images." });
    }
    req.body.slug = await uniqueSlug(Product, req.body.slug || slugSourceFor(req.body));
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: "Failed to create product", error: err.message });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    if (missingImageAltText(req.body)) {
      return res.status(400).json({ message: "Alt text is required for product images." });
    }
    // Edited without a slug? Keep the page address the product already has.
    if (!req.body.slug?.trim()) {
      const current = await Product.findById(req.params.id);
      if (current?.slug) req.body.slug = current.slug;
    }
    req.body.slug = await uniqueSlug(Product, req.body.slug || slugSourceFor(req.body), req.params.id);
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: "Failed to update product", error: err.message });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
});

module.exports = router;
