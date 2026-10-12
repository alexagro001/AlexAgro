// Admin login + recovery settings that work everywhere (localhost and live)
// without touching MongoDB or .env files.
//
// Only bcrypt hashes live here (never plain text), so this file is safe to
// commit. To change a secret from the codebase:
//   1. node hashSecret.js "your-new-password"      (run inside backend/)
//   2. Paste the printed hash below.
//   3. For the login password, also bump passwordVersion so the live server
//      applies it to the database on its next boot/redeploy.
module.exports = {
  username: "admin",

  // Login password hash. Applied to the database whenever passwordVersion
  // is higher than the version the stored admin was last synced with.
  passwordHash: "$2a$10$t0L0v6KYMgJCNZF8gXPT7.GUgrSajgid25zuWsQOKJYJSMtvn/Qvm",
  passwordVersion: 1,

  // Recovery key hash, used by "Forgot password?" on the admin login page
  // to set a new password without email or database access.
  recoveryKeyHash: "$2a$10$FQbH78hpwMXD1FkabpZ/4ObuCx8hKkiz.r8ii4Bxr2Y87.pw7kYCS",
};
