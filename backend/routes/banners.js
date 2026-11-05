const express = require("express");
const sharp = require("sharp");
const Banner = require("../models/Banner");
const { requireAuth } = require("../middleware/auth");
const demoData = require("../demoData");

const router = express.Router();

// banner id -> { v, type, body }: the optimised image, one entry per banner.
const imageCache = new Map();

// GET /api/banners -> public, sorted for the homepage slider
router.get("/", async (req, res) => {
  try {
    if (process.env.MONGO_URI && require("mongoose").connection.readyState === 1) {
      // Admin list keeps the raw image so the edit form saves it back unchanged.
      if (req.query.active === "all") {
        return res.json(await Banner.find({}).sort({ order: 1, createdAt: -1 }));
      }

      // Public list: uploaded images are multi-MB base64 strings, so they are left
      // out here and served one by one from /:id/image, which browsers can cache.
      const banners = await Banner.aggregate([
        { $match: { isActive: true } },
        { $sort: { order: 1, createdAt: -1 } },
        { $set: { image: { $cond: [{ $eq: [{ $substrBytes: ["$image", 0, 5] }, "data:"] }, null, "$image"] } } },
      ]);
      // Protocol-relative so the URL follows the page: https live, http in local dev.
      const base = `//${req.get("host")}${req.baseUrl}`;
      return res.json(
        banners.map((b) => ({
          ...b,
          image: b.image ?? `${base}/${b._id}/image?v=${new Date(b.updatedAt).getTime()}`,
        }))
      );
    }

    return res.json(demoData.banners);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch banners", error: err.message });
  }
});

// GET /api/banners/:id/image -> the uploaded image as a real file, resized and
// re-encoded to WebP (uploads are often 3-5MB photos).
router.get("/:id/image", async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id).select("image updatedAt").lean();
    const match = banner && /^data:([^;,]+);base64,/.exec(banner.image);
    if (!match) return res.status(404).json({ message: "Banner image not found" });

    const v = String(new Date(banner.updatedAt).getTime());
    let cached = imageCache.get(req.params.id);
    if (!cached || cached.v !== v) {
      const raw = Buffer.from(banner.image.slice(match[0].length), "base64");
      cached = { v, type: match[1], body: raw };
      if (/^image\/(jpeg|png|webp)$/.test(match[1])) {
        try {
          const body = await sharp(raw)
            .rotate() // apply EXIF orientation, which WebP output would otherwise drop
            .resize({ width: 1920, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();
          cached = { v, type: "image/webp", body };
        } catch (err) {
          console.error("Banner image optimisation failed, serving original:", err.message);
        }
      }
      imageCache.set(req.params.id, cached);
    }

    // Safe to cache forever: the list URL carries ?v=updatedAt, so an edit gets a new URL.
    res.set("Cache-Control", "public, max-age=31536000, immutable");
    res.type(cached.type).send(cached.body);
  } catch (err) {
    res.status(500).json({ message: "Failed to load banner image", error: err.message });
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
