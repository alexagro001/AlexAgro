const express = require("express");
const Banner = require("../models/Banner");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/banners -> public, sorted for the homepage slider
router.get("/", async (req, res) => {
  try {
    const { active } = req.query;
    const filter = {};
    if (active !== "all") filter.isActive = true;

    const banners = await Banner.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch banners", error: err.message });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.order === undefined || payload.order === null || payload.order === "") {
      const last = await Banner.findOne().sort({ order: -1 });
      payload.order = last ? last.order + 1 : 0;
    }
    const banner = await Banner.create(payload);
    res.status(201).json(banner);
  } catch (err) {
    res.status(400).json({ message: "Failed to create banner", error: err.message });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    res.json(banner);
  } catch (err) {
    res.status(400).json({ message: "Failed to update banner", error: err.message });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    res.json({ message: "Banner deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete banner", error: err.message });
  }
});

module.exports = router;
