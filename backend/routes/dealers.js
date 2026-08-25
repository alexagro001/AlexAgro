const express = require("express");
const Dealer = require("../models/Dealer");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/dealers -> public list, supports ?q=search&division=Dhaka
router.get("/", async (req, res) => {
  try {
    const { q, division, active } = req.query;
    const filter = {};

    if (active !== "all") filter.isActive = true; // admin panel can pass active=all to see everything
    if (division) filter.division = division;
    if (q) filter.$text = { $search: q };

    const dealers = await Dealer.find(filter).sort({ division: 1, name: 1 });
    res.json(dealers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch dealers", error: err.message });
  }
});

// GET /api/dealers/divisions -> distinct list, used to build a filter dropdown on the map page
router.get("/divisions", async (req, res) => {
  try {
    const divisions = await Dealer.distinct("division", { isActive: true });
    res.json(divisions.sort());
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch divisions", error: err.message });
  }
});

// GET /api/dealers/:id
router.get("/:id", async (req, res) => {
  try {
    const dealer = await Dealer.findById(req.params.id);
    if (!dealer) return res.status(404).json({ message: "Dealer not found" });
    res.json(dealer);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch dealer", error: err.message });
  }
});

// POST /api/dealers -> admin only
router.post("/", requireAuth, async (req, res) => {
  try {
    const dealer = await Dealer.create(req.body);
    res.status(201).json(dealer);
  } catch (err) {
    res.status(400).json({ message: "Failed to create dealer", error: err.message });
  }
});

// PUT /api/dealers/:id -> admin only
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const dealer = await Dealer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!dealer) return res.status(404).json({ message: "Dealer not found" });
    res.json(dealer);
  } catch (err) {
    res.status(400).json({ message: "Failed to update dealer", error: err.message });
  }
});

// DELETE /api/dealers/:id -> admin only
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const dealer = await Dealer.findByIdAndDelete(req.params.id);
    if (!dealer) return res.status(404).json({ message: "Dealer not found" });
    res.json({ message: "Dealer deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete dealer", error: err.message });
  }
});

module.exports = router;
