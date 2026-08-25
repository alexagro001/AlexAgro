const express = require("express");
const fs = require("fs");
const path = require("path");
const { upload, uploadDir } = require("../middleware/upload");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Images larger than this (before base64 encoding) are rejected — base64
// adds ~33% overhead, and MongoDB documents have a hard 16MB limit. Some
// records (Gallery items) can hold two images in one document (photo/video
// "url" plus a "thumbnail"), so this stays well under half of that limit
// to leave comfortable headroom.
const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4MB

// POST /api/upload  (multipart/form-data, field name "file") -> admin only
router.post("/", requireAuth, (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Upload failed" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file was received" });
    }

    const { buffer, mimetype, originalname, size } = req.file;

    try {
      if (mimetype.startsWith("image/")) {
        // Images: return a self-contained base64 data URI. There's no
        // separate file to serve afterwards, so there's no URL/host/path
        // mismatch, static-file-serving misconfiguration, or cross-origin
        // request that could fail later — the image data travels with the
        // record itself and always renders.
        if (size > MAX_IMAGE_BYTES) {
          return res.status(400).json({
            message: `Image is too large (${(size / 1024 / 1024).toFixed(1)}MB). Please use an image under 6MB.`,
          });
        }
        const dataUrl = `data:${mimetype};base64,${buffer.toString("base64")}`;
        return res.status(201).json({ url: dataUrl, filename: originalname, mimetype, size });
      }

      // Videos: still saved to disk and served from /uploads/<filename> —
      // base64-encoding a multi-megabyte video would blow past MongoDB's
      // 16MB document limit, so this path stays file-based.
      const ext = path.extname(originalname).toLowerCase();
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      fs.writeFileSync(path.join(uploadDir, filename), buffer);

      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;
      return res.status(201).json({ url: fileUrl, filename, mimetype, size });
    } catch (writeErr) {
      return res.status(500).json({ message: "Failed to process upload", error: writeErr.message });
    }
  });
});

module.exports = router;
