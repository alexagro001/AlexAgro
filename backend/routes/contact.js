const express = require("express");
const rateLimit = require("express-rate-limit");
const validator = require("validator");
const Contact = require("../models/Contact");
const { requireAuth } = require("../middleware/auth");
const { sendContactEmail } = require("../utils/sendEmail");

const router = express.Router();

// Prevent the contact form from being used to spam the inbox.
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many messages sent. Please try again later." },
});

// POST /api/contact -> public, anyone visiting the site can submit this
router.post("/", contactLimiter, async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email and message are required" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    const contact = await Contact.create({ name, email, phone, subject, message });

    const result = await sendContactEmail({ name, email, phone, subject, message });
    if (result.sent) {
      contact.emailSent = true;
      await contact.save();
    }

    res.status(201).json({
      message: "Thank you! Your message has been received.",
      emailSent: result.sent,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to submit message", error: err.message });
  }
});

// GET /api/contact -> admin only, view all inquiries
router.get("/", requireAuth, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages", error: err.message });
  }
});

// PATCH /api/contact/:id/read -> admin only, mark as read
router.patch("/:id/read", requireAuth, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!contact) return res.status(404).json({ message: "Message not found" });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ message: "Failed to update message", error: err.message });
  }
});

// DELETE /api/contact/:id -> admin only
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ message: "Message not found" });
    res.json({ message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete message", error: err.message });
  }
});

module.exports = router;
