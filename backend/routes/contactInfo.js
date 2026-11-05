const express = require("express");
const mongoose = require("mongoose");
const ContactInfo = require("../models/ContactInfo");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const FIELDS = ["address", "addressBn", "mapUrl", "phone", "email", "facebook"];
const dbReady = () => Boolean(process.env.MONGO_URI) && mongoose.connection.readyState === 1;

// GET /api/contact-info -> public. {} until an admin saves; the frontend then uses its defaults.
router.get("/", async (req, res) => {
  try {
    if (!dbReady()) return res.json({});
    res.json((await ContactInfo.findOne().lean()) || {});
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch contact info", error: err.message });
  }
});

// PUT /api/contact-info -> admin only. Updates the single document, creating it on first save.
router.put("/", requireAuth, async (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ message: "Database is not connected, so contact info can't be saved right now." });
  }
  try {
    const update = {};
    for (const key of FIELDS) {
      if (req.body[key] !== undefined) update[key] = String(req.body[key] ?? "");
    }
    const info = await ContactInfo.findOneAndUpdate({}, update, { new: true, upsert: true, runValidators: true });
    res.json(info);
  } catch (err) {
    const message =
      err.name === "ValidationError"
        ? Object.values(err.errors).map((e) => e.message).join(" ")
        : "Failed to save contact info";
    res.status(400).json({ message, error: err.message });
  }
});

module.exports = router;
