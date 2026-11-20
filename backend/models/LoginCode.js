const mongoose = require("mongoose");

// One emailed sign-in / password-reset code. Only a hash of the code is kept,
// and MongoDB removes the record on its own once expiresAt has passed.
const LoginCodeSchema = new mongoose.Schema(
  {
    challengeId: { type: String, required: true, unique: true },
    adminId: { type: String, required: true, index: true },
    purpose: { type: String, enum: ["login", "reset"], required: true },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    resendCount: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LoginCode", LoginCodeSchema);
