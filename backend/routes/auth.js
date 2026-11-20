const crypto = require("crypto");
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const Admin = require("../models/Admin");
const adminAccess = require("../config/adminAccess");
const { requireAuth } = require("../middleware/auth");
const {
  CODE_TTL_MS,
  RESEND_COOLDOWN_MS,
  issueCode,
  verifyCode,
  prepareResend,
  latestCode,
  discardCode,
} = require("../utils/loginCode");
const { sendAdminCodeEmail } = require("../utils/sendEmail");

const router = express.Router();

// Slow down brute-force login attempts.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many login attempts. Please try again later." },
});

// "Forgot password?" sends an email, so keep requests tight.
const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Too many reset attempts. Please try again later." },
});

// Checking or resending an emailed code. Each code also locks itself after a
// few wrong tries, so this is only a second layer.
const codeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: "Too many code attempts. Please try again later." },
});

function signToken(admin) {
  return jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// What the admin panel stores after a successful sign-in.
function sessionResponse(admin) {
  const id = admin._id || admin.id;
  const token = signToken({ _id: id, role: admin.role });
  return { token, admin: { id, name: admin.name, username: admin.username, role: admin.role } };
}

// Where sign-in / reset codes are emailed: ADMIN_LOGIN_EMAIL if set, else the
// email in config/adminAccess.js, else the admin's own email, else the company
// inbox the contact form already uses.
function codeEmailFor(admin) {
  return (
    process.env.ADMIN_LOGIN_EMAIL ||
    (admin.username === adminAccess.username ? adminAccess.email : "") ||
    admin.email ||
    process.env.CONTACT_RECEIVER_EMAIL ||
    process.env.SMTP_USER ||
    ""
  );
}

function maskEmail(email) {
  const [name, domain] = String(email).split("@");
  if (!name || !domain) return "";
  return `${name.slice(0, 2)}***@${domain}`;
}

const CODE_NOT_SENT = "We couldn't send the login code. Please try again in a moment, or contact the site owner.";

async function findAdminById(req, id) {
  if (req.app.locals.demoAuthEnabled) {
    const demoAdmin = req.app.locals.demoAdmin;
    return id === String(demoAdmin.id) ? demoAdmin : null;
  }
  return Admin.findById(id);
}

// Creates a code and emails it. `delivered` is false when the email could not
// be sent. Local development without SMTP prints the code in the terminal.
async function sendCode(req, admin, purpose, resendCount = 0) {
  const adminId = String(admin._id || admin.id);
  const to = codeEmailFor(admin);
  const { challengeId, code, expiresInSeconds } = await issueCode(req, { adminId, purpose, resendCount });

  let delivered = false;
  if (to) {
    const result = await sendAdminCodeEmail({ to, code, purpose, minutes: CODE_TTL_MS / 60000 });
    delivered = result.sent;
    if (!delivered && result.reason === "smtp-not-configured" && process.env.NODE_ENV !== "production") {
      console.log(`[local only] Admin ${purpose} code for ${to}: ${code}`);
      delivered = true;
    }
  } else if (process.env.NODE_ENV !== "production") {
    console.log(`[local only] Admin ${purpose} code (no email address set): ${code}`);
    delivered = true;
  }

  if (!delivered) await discardCode(req, challengeId);
  return { challengeId, delivered, maskedEmail: maskEmail(to), expiresInSeconds };
}

// POST /api/auth/login -> step 1 of 2: checks the password, then emails a code.
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    let admin;
    if (req.app.locals.demoAuthEnabled) {
      admin = req.app.locals.demoAdmin;
      if (
        username.trim().toLowerCase() !== admin.username ||
        !(await bcrypt.compare(password, req.app.locals.demoAdminPasswordHash))
      ) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
    } else {
      admin = await Admin.findOne({ username: username.toLowerCase() }).select("+password");
      if (!admin) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const isMatch = await admin.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
    }

    // Emergency switch for the site owner: if the code email ever stops working,
    // set ADMIN_OTP_DISABLED=true on the server to sign in with the password
    // alone, then remove it once email is fixed.
    if (process.env.ADMIN_OTP_DISABLED === "true") {
      return res.json(sessionResponse(admin));
    }

    const sent = await sendCode(req, admin, "login");
    if (!sent.delivered) {
      return res.status(503).json({ message: CODE_NOT_SENT });
    }

    res.json({
      requiresCode: true,
      challengeId: sent.challengeId,
      maskedEmail: sent.maskedEmail,
      expiresInSeconds: sent.expiresInSeconds,
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

// POST /api/auth/verify-code -> step 2 of 2: the emailed code opens the session.
router.post("/verify-code", codeLimiter, async (req, res) => {
  try {
    const { challengeId, code } = req.body;
    if (!challengeId || !code) {
      return res.status(400).json({ message: "The 6-digit code is required" });
    }

    const result = await verifyCode(req, {
      challengeId: String(challengeId),
      code: String(code).trim(),
      purpose: "login",
    });
    if (!result.ok) {
      return res.status(401).json({ message: result.message });
    }

    const admin = await findAdminById(req, result.adminId);
    if (!admin) {
      return res.status(401).json({ message: "Admin account not found" });
    }

    res.json(sessionResponse(admin));
  } catch (err) {
    res.status(500).json({ message: "Could not verify the code", error: err.message });
  }
});

// POST /api/auth/resend-code -> emails a new code (old one stops working).
router.post("/resend-code", codeLimiter, async (req, res) => {
  try {
    const { challengeId } = req.body;
    if (!challengeId) {
      return res.status(400).json({ message: "Please start again" });
    }

    const check = await prepareResend(req, { challengeId: String(challengeId) });
    if (!check.ok) {
      return res.status(check.status).json({ message: check.message });
    }

    const admin = await findAdminById(req, check.adminId);
    if (!admin) {
      return res.status(400).json({ message: "This code has expired. Please start again." });
    }

    const sent = await sendCode(req, admin, check.purpose, check.resendCount + 1);
    if (!sent.delivered) {
      return res.status(503).json({ message: CODE_NOT_SENT });
    }

    res.json({
      challengeId: sent.challengeId,
      maskedEmail: sent.maskedEmail,
      expiresInSeconds: sent.expiresInSeconds,
    });
  } catch (err) {
    res.status(500).json({ message: "Could not resend the code", error: err.message });
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

// POST /api/auth/forgot-password -> "Forgot password?" step 1: emails a reset code.
// The answer is the same whether or not the username exists.
router.post("/forgot-password", resetLimiter, async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const name = String(username).trim().toLowerCase();
    let admin = null;
    if (req.app.locals.demoAuthEnabled) {
      if (name === req.app.locals.demoAdmin.username) admin = req.app.locals.demoAdmin;
    } else {
      admin = await Admin.findOne({ username: name });
    }

    const message = "If that account exists, a reset code has been emailed to the admin address.";
    if (!admin) {
      return res.json({ message, challengeId: crypto.randomBytes(16).toString("hex") });
    }

    // A code was emailed a moment ago: reuse it instead of sending another.
    const adminId = String(admin._id || admin.id);
    const recent = await latestCode(req, { adminId, purpose: "reset" });
    if (recent && Date.now() - new Date(recent.createdAt).getTime() < RESEND_COOLDOWN_MS) {
      return res.json({ message, challengeId: recent.challengeId });
    }

    const sent = await sendCode(req, admin, "reset");
    if (!sent.delivered) {
      return res.status(503).json({ message: CODE_NOT_SENT });
    }

    res.json({ message, challengeId: sent.challengeId });
  } catch (err) {
    res.status(500).json({ message: "Could not start the password reset", error: err.message });
  }
});

// POST /api/auth/reset-password -> "Forgot password?" step 2: the emailed code
// proves ownership, then the new password is saved.
router.post("/reset-password", codeLimiter, async (req, res) => {
  try {
    const { challengeId, code, newPassword } = req.body;
    if (!challengeId || !code || !newPassword) {
      return res.status(400).json({ message: "Reset code and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const result = await verifyCode(req, {
      challengeId: String(challengeId),
      code: String(code).trim(),
      purpose: "reset",
    });
    if (!result.ok) {
      return res.status(400).json({ message: result.message });
    }

    if (req.app.locals.demoAuthEnabled) {
      req.app.locals.demoAdminPasswordHash = await bcrypt.hash(newPassword, 10);
      return res.json({ message: "Password reset. You can sign in now." });
    }

    const admin = await Admin.findById(result.adminId).select("+password");
    if (!admin) {
      return res.status(400).json({ message: "That code is not valid or has expired. Please try again." });
    }

    admin.password = newPassword;
    await admin.save();
    res.json({ message: "Password reset. You can sign in now." });
  } catch (err) {
    res.status(500).json({ message: "Could not reset password", error: err.message });
  }
});

module.exports = router;