const express = require("express");
const Dealer = require("../models/Dealer");
const { requireAuth } = require("../middleware/auth");
const demoData = require("../demoData");

const router = express.Router();

// GET /api/dealers -> public list, supports ?q=search&division=Dhaka
router.get("/", async (req, res) => {
  try {
    const { division, q, active } = req.query;

    if (process.env.MONGO_URI && require("mongoose").connection.readyState === 1) {
      const filter = {};
      if (active !== "all") filter.isActive = true;
      if (division) filter.division = division;
      if (q) filter.$text = { $search: q };
      const dealers = await Dealer.find(filter).sort({ division: 1, name: 1 });
      return res.json(dealers);
    }

    // Demo fallback: serve bundled sample data when MongoDB is not connected.
    const dealers = demoData.dealers.filter((dealer) => {
      if (active !== "all" && dealer.isActive !== true) return false;
      if (division && dealer.division !== division) return false;
      if (q) {
        const haystack = `${dealer.name} ${dealer.area} ${dealer.address} ${dealer.district}`.toLowerCase();
        if (!haystack.includes(String(q).toLowerCase())) return false;
      }
      return true;
    });
    return res.json(dealers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch dealers", error: err.message });
  }
});

// GET /api/dealers/divisions -> distinct list, used to build a filter dropdown on the map page
router.get("/divisions", async (req, res) => {
  try {
    if (process.env.MONGO_URI && require("mongoose").connection.readyState === 1) {
      const divisions = await Dealer.distinct("division", { isActive: true });
      return res.json(divisions.sort());
    }

    const divisions = [...new Set(demoData.dealers.map((dealer) => dealer.division))];
    return res.json(divisions.sort());
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch divisions", error: err.message });
  }
});

// GET /api/dealers/:id
router.get("/:id", async (req, res) => {
  try {
    if (!(process.env.MONGO_URI && require("mongoose").connection.readyState === 1)) {
      const demoItem = demoData.dealers.find((d) => d._id === req.params.id);
      if (!demoItem) return res.status(404).json({ message: "Dealer not found" });
      return res.json(demoItem);
    }
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
