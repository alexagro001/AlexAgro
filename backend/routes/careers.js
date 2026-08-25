const express = require("express");
const Career = require("../models/Career");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { active } = req.query;
    const filter = {};
    if (active !== "all") filter.isActive = true;

    const careers = await Career.find(filter).sort({ createdAt: -1 });
    res.json(careers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch careers", error: err.message });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const career = await Career.create(req.body);
    res.status(201).json(career);
  } catch (err) {
    res.status(400).json({ message: "Failed to create career post", error: err.message });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const career = await Career.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!career) return res.status(404).json({ message: "Career post not found" });
    res.json(career);
  } catch (err) {
    res.status(400).json({ message: "Failed to update career post", error: err.message });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const career = await Career.findByIdAndDelete(req.params.id);
    if (!career) return res.status(404).json({ message: "Career post not found" });
    res.json({ message: "Career post deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete career post", error: err.message });
  }
});

module.exports = router;
