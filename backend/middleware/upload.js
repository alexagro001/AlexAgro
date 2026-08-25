const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function fileFilter(req, file, cb) {
  if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);
  cb(new Error("Unsupported file type. Please upload an image, video, or a PDF/Word document."));
}

// Memory storage: the file arrives as a Buffer (req.file.buffer) instead of
// being written to disk automatically. The upload route decides what to do
// with it per type — see routes/upload.js. Using memory storage (rather
// than diskStorage) means there's no destination/filename callback timing
// to get wrong, and images can be turned into a fully self-contained data
// URI with nothing further to serve or point a URL at.
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

module.exports = { upload, uploadDir };
