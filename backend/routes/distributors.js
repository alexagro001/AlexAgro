const express = require("express");
const Distributor = require("../models/Distributor");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/distributors -> public list, supports ?q=search&division=Dhaka
router.get("/", async (req, res) => {
  try {
    const { q, division, active } = req.query;
    const filter = {};

    if (active !== "all") filter.isActive = true;
    if (division) filter.division = division;
    if (q) filter.$text = { $search: q };

    const distributors = await Distributor.find(filter).sort({ division: 1, name: 1 });
    res.json(distributors);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch distributors", error: err.message });
  }
});

router.get("/divisions", async (req, res) => {
  try {
    const divisions = await Distributor.distinct("division", { isActive: true });
    res.json(divisions.sort());
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch divisions", error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const distributor = await Distributor.findById(req.params.id);
    if (!distributor) return res.status(404).json({ message: "Distributor not found" });
    res.json(distributor);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch distributor", error: err.message });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const distributor = await Distributor.create(req.body);
    res.status(201).json(distributor);
  } catch (err) {
    res.status(400).json({ message: "Failed to create distributor", error: err.message });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const distributor = await Distributor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!distributor) return res.status(404).json({ message: "Distributor not found" });
    res.json(distributor);
  } catch (err) {
    res.status(400).json({ message: "Failed to update distributor", error: err.message });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const distributor = await Distributor.findByIdAndDelete(req.params.id);
    if (!distributor) return res.status(404).json({ message: "Distributor not found" });
    res.json({ message: "Distributor deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete distributor", error: err.message });
  }
});

module.exports = router;
