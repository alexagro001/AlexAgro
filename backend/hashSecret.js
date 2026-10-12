// Prints a bcrypt hash for config/adminAccess.js.
// Usage: node hashSecret.js "your-new-password-or-recovery-key"
const bcrypt = require("bcryptjs");

const secret = process.argv[2];
if (!secret || secret.length < 8) {
  console.error('Usage: node hashSecret.js "secret" (at least 8 characters)');
  process.exitCode = 1;
} else {
  console.log(bcrypt.hashSync(secret, 10));
}
