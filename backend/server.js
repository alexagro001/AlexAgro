require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const Admin = require("./models/Admin");

const authRoutes = require("./routes/auth");
const dealerRoutes = require("./routes/dealers");
const distributorRoutes = require("./routes/distributors");
const productRoutes = require("./routes/products");
const galleryRoutes = require("./routes/gallery");
const careerRoutes = require("./routes/careers");
const careerApplicationRoutes = require("./routes/careerApplications");
const contactRoutes = require("./routes/contact");
const uploadRoutes = require("./routes/upload");
const bannerRoutes = require("./routes/banners");

const app = express();

// ---- Core middleware ----
// 12mb accommodates a base64-encoded image (up to ~6MB raw, ~8MB encoded)
// riding along inside a Dealer/Product/Gallery/Banner create-or-update
// JSON payload, plus the rest of that record's fields.
app.use(express.json({ limit: "12mb" }));

const allowedOrigins = (process.env.CLIENT_URLS || "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const isLocalFrontendOrigin = (origin) => {
  if (!origin) return true;
  return /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
};

app.use(
  cors({
    origin: function (origin, callback) {
      // allow tools like curl/Postman (no origin), any listed frontend URL,
      // and typical local Vite ports during development.
      if (!origin || allowedOrigins.includes(origin) || isLocalFrontendOrigin(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ---- Routes ----
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// Uploaded photos/videos are served directly from /uploads/<filename>
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/dealers", dealerRoutes);
app.use("/api/distributors", distributorRoutes);
app.use("/api/products", productRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/careers", careerRoutes);
app.use("/api/career-applications", careerApplicationRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/banners", bannerRoutes);

// ---- 404 + error handler ----
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

// ---- Boot ----
const PORT = process.env.PORT || 5000;

async function ensureDefaultAdmin() {
  const existing = await Admin.countDocuments();
  if (existing > 0) return;

  const username = (process.env.ADMIN_DEFAULT_USERNAME || "admin").toLowerCase();
  const password = process.env.ADMIN_DEFAULT_PASSWORD || "change-me-now";
  const email = process.env.ADMIN_DEFAULT_EMAIL || "";

  await Admin.create({ name: "Admin", username, password, email, role: "superadmin" });
  console.log(
    `No admin found -> created default admin "${username}". Log in and change the password immediately.`
  );
}

async function start() {
  const dbReady = await connectDB();
  app.locals.demoMode = !dbReady;

  if (dbReady) {
    await ensureDefaultAdmin();
  } else {
    app.locals.demoAuthEnabled =
      process.env.NODE_ENV !== "production" && Boolean(process.env.DEMO_ADMIN_PASSWORD);
    app.locals.demoAdmin = {
      id: "demo-admin",
      name: "Admin",
      username: (process.env.DEMO_ADMIN_USERNAME || "admin").toLowerCase(),
      role: "superadmin",
    };
    app.locals.demoAdminPassword = process.env.DEMO_ADMIN_PASSWORD;
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = require("crypto").randomBytes(48).toString("hex");
    }
    console.log("Demo mode enabled: public API endpoints will serve bundled sample data.");
    if (app.locals.demoAuthEnabled) {
      console.log(`Local demo admin login enabled (username: ${app.locals.demoAdmin.username}).`);
    } else if (process.env.NODE_ENV !== "production") {
      console.warn("Local demo admin login disabled; set DEMO_ADMIN_PASSWORD to enable it.");
    }
  }

  app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`));
}

start();
