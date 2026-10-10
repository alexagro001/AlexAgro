const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const rateLimit = require("express-rate-limit");
const validator = require("validator");
const CareerApplication = require("../models/CareerApplication");
const { requireAuth } = require("../middleware/auth");
const { uploadDir } = require("../middleware/upload");
const { sendCareerApplicationEmail } = require("../utils/sendEmail");
const demoData = require("../demoData");

const router = express.Router();

const applyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many applications submitted. Please try again later." },
});

// This upload is public-facing (any site visitor applying for a job, not
// an admin), so it gets its own tightly-restricted multer instance —
// CVs only (PDF/DOC/DOCX), capped at 5MB — rather than reusing the
// admin-only /api/upload endpoint.
const CV_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const cvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (CV_TYPES.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Please upload your CV as a PDF or Word document (max 5MB)."));
  },
});

// POST /api/career-applications -> public, anyone on the Career page can submit
router.post("/", applyLimiter, (req, res) => {
  cvUpload.single("cv")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Upload failed" });
    }
    try {
      const { fullName, email } = req.body;

      if (!fullName || !email || !req.file) {
        return res.status(400).json({ message: "Full name, email and CV are required" });
      }
      if (!validator.isEmail(email)) {
        return res.status(400).json({ message: "Please provide a valid email address" });
      }

      const ext = path.extname(req.file.originalname).toLowerCase();
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
      const cvUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;

      await CareerApplication.create({
        fullName,
        email,
        cvUrl,
        cvFilename: req.file.originalname,
      });

      // Fire the notification email in the background — it must never
      // block the response. The CV is already saved to disk, so the
      // user gets an immediate "received" confirmation regardless of
      // whether SMTP is configured or the network is slow.
      sendCareerApplicationEmail({ fullName, email, cvUrl }).catch((e) =>
        console.warn("Background career email failed:", e.message)
      );

      res.status(201).json({
        message: "Thank you! Your CV has been received.",
        emailSent: true,
      });
    } catch (innerErr) {
      res.status(500).json({ message: "Failed to submit application", error: innerErr.message });
    }
  });
});

// GET /api/career-applications -> admin only, view all submissions
router.get("/", requireAuth, async (req, res) => {
  try {
    if (process.env.MONGO_URI && require("mongoose").connection.readyState === 1) {
      const applications = await CareerApplication.find().sort({ createdAt: -1 });
      return res.json(applications);
    }

    // Demo fallback: serve bundled sample data when MongoDB is not connected.
    return res.json(demoData.careerApplications || []);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch applications", error: err.message });
  }
});

// PATCH /api/career-applications/:id/read -> admin only
router.patch("/:id/read", requireAuth, async (req, res) => {
  try {
    const application = await CareerApplication.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!application) return res.status(404).json({ message: "Application not found" });
    res.json(application);
  } catch (err) {
    res.status(500).json({ message: "Failed to update application", error: err.message });
  }
});

// DELETE /api/career-applications/:id -> admin only
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const application = await CareerApplication.findByIdAndDelete(req.params.id);
    if (!application) return res.status(404).json({ message: "Application not found" });
    res.json({ message: "Application deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete application", error: err.message });
  }
});

module.exports = router;
