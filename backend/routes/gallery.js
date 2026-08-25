const express = require("express");
const GalleryItem = require("../models/GalleryItem");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/gallery?type=photo
router.get("/", async (req, res) => {
  try {
    const { type, active } = req.query;
    const filter = {};
    if (active !== "all") filter.isActive = true;
    if (type) filter.type = type;

    const items = await GalleryItem.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch gallery items", error: err.message });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const payload = { ...req.body };

    if (payload.order === undefined || payload.order === null || payload.order === "") {
      const last = await GalleryItem.findOne({ type: payload.type }).sort({ order: -1 });
      payload.order = last ? last.order + 1 : 0;
    }

    const item = await GalleryItem.create(payload);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: "Failed to create gallery item", error: err.message });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const item = await GalleryItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ message: "Gallery item not found" });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: "Failed to update gallery item", error: err.message });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const item = await GalleryItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Gallery item not found" });
    res.json({ message: "Gallery item deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete gallery item", error: err.message });
  }
});

module.exports = router;
