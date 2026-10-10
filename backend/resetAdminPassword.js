require("dotenv").config();

const mongoose = require("mongoose");
const Admin = require("./models/Admin");

async function resetAdminPassword() {
  const { MONGO_URI, ADMIN_PASSWORD_RESET } = process.env;
  const username = (
    process.env.ADMIN_USERNAME_RESET ||
    process.env.ADMIN_DEFAULT_USERNAME ||
    "admin"
  )
    .trim()
    .toLowerCase();

  if (!MONGO_URI) {
    throw new Error("MONGO_URI must be set to the target application's database.");
  }
  if (!ADMIN_PASSWORD_RESET || ADMIN_PASSWORD_RESET.length < 12) {
    throw new Error("Set ADMIN_PASSWORD_RESET to a password of at least 12 characters.");
  }

  await mongoose.connect(MONGO_URI);
  try {
    const admin = await Admin.findOne({ username }).select("+password");
    if (!admin) {
      throw new Error(`No admin account found for username "${username}".`);
    }

    admin.password = ADMIN_PASSWORD_RESET;
    await admin.save();

    const updatedAdmin = await Admin.findById(admin._id).select("+password");
    if (!(await updatedAdmin.comparePassword(ADMIN_PASSWORD_RESET))) {
      throw new Error("Password reset verification failed.");
    }

    console.log(`Password reset and verified for admin "${username}".`);
  } finally {
    await mongoose.disconnect();
  }
}

resetAdminPassword().catch((err) => {
  console.error(`Admin password reset failed: ${err.message}`);
  process.exitCode = 1;
});
