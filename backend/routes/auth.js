const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const Admin = require("../models/Admin");
const adminAccess = require("../config/adminAccess");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Slow down brute-force login attempts.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many login attempts. Please try again later." },
});

// Recovery keys are long, but still cap guesses tightly.
const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Too many reset attempts. Please try again later." },
});

function signToken(admin) {
  return jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// POST /api/auth/login
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    if (req.app.locals.demoAuthEnabled) {
      const admin = req.app.locals.demoAdmin;
      if (
        username.trim().toLowerCase() !== admin.username ||
        !(await bcrypt.compare(password, req.app.locals.demoAdminPasswordHash))
      ) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const token = signToken({ _id: admin.id, role: admin.role });
      return res.json({
        token,
        admin: { id: admin.id, name: admin.name, username: admin.username, role: admin.role },
      });
    }

    const admin = await Admin.findOne({ username: username.toLowerCase() }).select("+password");
    if (!admin) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = signToken(admin);
    res.json({
      token,
      admin: { id: admin._id, name: admin.name, username: admin.username, role: admin.role },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

// GET /api/auth/me -> confirms the current token is valid and returns the admin profile
router.get("/me", requireAuth, async (req, res) => {
  res.json({
    id: req.admin._id,
    name: req.admin.name,
    username: req.admin.username,
    role: req.admin.role,
  });
});

// PUT /api/auth/change-password
router.put("/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are both required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    if (req.app.locals.demoAuthEnabled) {
      if (!(await bcrypt.compare(currentPassword, req.app.locals.demoAdminPasswordHash))) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      req.app.locals.demoAdminPasswordHash = await bcrypt.hash(newPassword, 10);
      return res.json({ message: "Password updated for this local session (resets when the server restarts)." });
    }

    const admin = await Admin.findById(req.admin._id).select("+password");
    if (!admin) {
      return res.status(404).json({ message: "Admin account not found" });
    }

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    admin.password = newPassword;
    await admin.save();

    // Re-fetch and confirm the hash actually changed, so a silent failure
    // here is impossible - either we can prove it worked, or we return a
    // clear error instead of a false "success".
    const confirmAdmin = await Admin.findById(admin._id).select("+password");
    const stillMatchesOld = await confirmAdmin.comparePassword(currentPassword);
    if (stillMatchesOld) {
      return res.status(500).json({
        message: "Password save did not take effect. Please try again or contact support.",
      });
    }

    res.json({ message: "Password updated successfully. Use your new password next time you log in." });
  } catch (err) {
    res.status(500).json({ message: "Could not update password", error: err.message });
  }
});

// POST /api/auth/reset-password -> "Forgot password?" on the login page.
// Proves ownership with the recovery key from config/adminAccess.js instead
// of email, so it works even when SMTP isn't configured.
router.post("/reset-password", resetLimiter, async (req, res) => {
  try {
    const { username, recoveryKey, newPassword } = req.body;
    if (!username || !recoveryKey || !newPassword) {
      return res.status(400).json({ message: "Username, recovery key and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const keyOk = await bcrypt.compare(recoveryKey.trim(), adminAccess.recoveryKeyHash);
    const name = username.trim().toLowerCase();

    if (req.app.locals.demoAuthEnabled) {
      if (!keyOk || name !== req.app.locals.demoAdmin.username) {
        return res.status(400).json({ message: "Invalid username or recovery key" });
      }
      req.app.locals.demoAdminPasswordHash = await bcrypt.hash(newPassword, 10);
      return res.json({ message: "Password reset. You can sign in now." });
    }

    const admin = keyOk ? await Admin.findOne({ username: name }).select("+password") : null;
    if (!admin) {
      return res.status(400).json({ message: "Invalid username or recovery key" });
    }

    admin.password = newPassword;
    await admin.save();
    res.json({ message: "Password reset. You can sign in now." });
  } catch (err) {
    res.status(500).json({ message: "Could not reset password", error: err.message });
  }
});

module.exports = router;