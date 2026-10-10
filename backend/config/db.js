const mongoose = require("mongoose");

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.warn(
      "MONGO_URI is missing. Starting in demo mode with bundled sample data. Copy backend/.env.example to backend/.env to enable MongoDB Atlas."
    );
    return false;
  }

  // A cold container's networking/DNS can take a moment to be fully ready,
  // which occasionally causes the very first connection attempt to fail
  // even though the URI and credentials are correct. Retry a few times
  // with a short growing delay before giving up, instead of crashing
  // immediately and relying on the host platform to restart the process.
  const MAX_ATTEMPTS = 5;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await mongoose.connect(uri);
      console.log(`MongoDB connected -> ${mongoose.connection.host}`);
      return true;
    } catch (err) {
      const isLastAttempt = attempt === MAX_ATTEMPTS;
      console.warn(
        `MongoDB connection attempt ${attempt}/${MAX_ATTEMPTS} failed: ${err.message}`
      );
      if (isLastAttempt) {
        console.warn("MongoDB unavailable; falling back to demo mode.");
        return false;
      }
      await wait(attempt * 2000);
    }
  }

  return false;
}

module.exports = connectDB;