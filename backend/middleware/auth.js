const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// Verifies the Bearer token and attaches req.admin. Use on every write route
// (create/update/delete) so only logged-in admins can change site content.
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (req.app.locals.demoAuthEnabled) {
      const demoAdmin = req.app.locals.demoAdmin;
      if (decoded.id !== demoAdmin.id || decoded.role !== demoAdmin.role) {
        return res.status(401).json({ message: "Not authorized, invalid or expired token" });
      }

      req.admin = { _id: demoAdmin.id, ...demoAdmin };
      return next();
    }

    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({ message: "Not authorized, admin no longer exists" });
    }

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, invalid or expired token" });
  }
}

module.exports = { requireAuth };
