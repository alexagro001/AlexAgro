const express = require("express");
const Distributor = require("../models/Distributor");
const { requireAuth } = require("../middleware/auth");
const demoData = require("../demoData");

const router = express.Router();

// GET /api/distributors -> public list, supports ?q=search&division=Dhaka
router.get("/", async (req, res) => {
  try {
    const { division, q, active } = req.query;

    if (process.env.MONGO_URI && require("mongoose").connection.readyState === 1) {
      const filter = {};
      if (active !== "all") filter.isActive = true;
      if (division) filter.division = division;
      if (q) filter.$text = { $search: q };
      const distributors = await Distributor.find(filter).sort({ division: 1, name: 1 });
      return res.json(distributors);
    }

    // Demo fallback: serve bundled sample data when MongoDB is not connected.
    const distributors = demoData.distributors.filter((distributor) => {
      if (active !== "all" && distributor.isActive !== true) return false;
      if (division && distributor.division !== division) return false;
      if (q) {
        const haystack = `${distributor.name} ${distributor.area} ${distributor.address} ${distributor.district}`.toLowerCase();
        if (!haystack.includes(String(q).toLowerCase())) return false;
      }
      return true;
    });
    return res.json(distributors);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch distributors", error: err.message });
  }
});

router.get("/divisions", async (req, res) => {
  try {
    if (process.env.MONGO_URI && require("mongoose").connection.readyState === 1) {
      const divisions = await Distributor.distinct("division", { isActive: true });
      return res.json(divisions.sort());
    }

    const divisions = [...new Set(demoData.distributors.map((distributor) => distributor.division))];
    return res.json(divisions.sort());
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch divisions", error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (!(process.env.MONGO_URI && require("mongoose").connection.readyState === 1)) {
      const demoItem = demoData.distributors.find((d) => d._id === req.params.id);
      if (!demoItem) return res.status(404).json({ message: "Distributor not found" });
      return res.json(demoItem);
    }
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
