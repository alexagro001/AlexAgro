const crypto = require("crypto");
const LoginCode = require("../models/LoginCode");

// Rules for the emailed codes used by the admin sign-in and "Forgot password?".
const CODE_TTL_MS = 5 * 60 * 1000; // a code works for 5 minutes
const MAX_ATTEMPTS = 5; // wrong guesses allowed before the code is thrown away
const MAX_RESENDS = 3; // "Resend code" presses allowed per sign-in
const RESEND_COOLDOWN_MS = 30 * 1000; // wait this long before asking for another

// ---- Storage ----
// Live site: MongoDB (LoginCode model). Local demo mode has no database, so
// the same operations run against an in-memory Map instead.
const memory = new Map();

function purgeExpiredMemory() {
  const now = Date.now();
  for (const [id, rec] of memory) {
    if (rec.expiresAt.getTime() <= now) memory.delete(id);
  }
}

const memoryStore = {
  async removeFor(adminId, purpose) {
    for (const [id, rec] of memory) {
      if (rec.adminId === adminId && rec.purpose === purpose) memory.delete(id);
    }
  },
  async insert(rec) {
    purgeExpiredMemory();
    memory.set(rec.challengeId, { ...rec, createdAt: new Date(Date.now()) });
  },
  async get(challengeId) {
    return memory.get(challengeId) || null;
  },
  async bump(challengeId) {
    const rec = memory.get(challengeId);
    if (!rec) return null;
    rec.attempts += 1;
    return { ...rec };
  },
  async remove(challengeId) {
    return memory.delete(challengeId);
  },
  async latestFor(adminId, purpose) {
    let latest = null;
    for (const rec of memory.values()) {
      if (rec.adminId !== adminId || rec.purpose !== purpose) continue;
      if (!latest || rec.createdAt > latest.createdAt) latest = rec;
    }
    return latest;
  },
};

const mongoStore = {
  async removeFor(adminId, purpose) {
    await LoginCode.deleteMany({ adminId, purpose });
  },
  async insert(rec) {
    await LoginCode.create(rec);
  },
  async get(challengeId) {
    return LoginCode.findOne({ challengeId }).lean();
  },
  // Atomic, so many guesses sent at the same moment are still all counted.
  async bump(challengeId) {
    return LoginCode.findOneAndUpdate({ challengeId }, { $inc: { attempts: 1 } }, { new: true }).lean();
  },
  async remove(challengeId) {
    const result = await LoginCode.deleteOne({ challengeId });
    return result.deletedCount === 1;
  },
  async latestFor(adminId, purpose) {
    return LoginCode.findOne({ adminId, purpose }).sort({ createdAt: -1 }).lean();
  },
};

function storeFor(req) {
  return req.app.locals.demoAuthEnabled ? memoryStore : mongoStore;
}

// ---- Helpers ----
function hashCode(challengeId, code) {
  return crypto.createHmac("sha256", process.env.JWT_SECRET).update(`${challengeId}:${code}`).digest("hex");
}

function sameHash(a, b) {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

const GENERIC_BAD_CODE = "That code is not valid or has expired. Please try again.";

// Creates a fresh 6-digit code for this admin. Any older code for the same
// purpose stops working, so only the newest email is ever valid.
async function issueCode(req, { adminId, purpose, resendCount = 0 }) {
  const store = storeFor(req);
  const challengeId = crypto.randomBytes(16).toString("hex");
  const code = String(crypto.randomInt(0, 1000000)).padStart(6, "0");

  await store.removeFor(adminId, purpose);
  await store.insert({
    challengeId,
    adminId,
    purpose,
    codeHash: hashCode(challengeId, code),
    attempts: 0,
    resendCount,
    expiresAt: new Date(Date.now() + CODE_TTL_MS),
  });

  return { challengeId, code, expiresInSeconds: CODE_TTL_MS / 1000 };
}

// Checks a typed code. A correct code is used up immediately (works once).
async function verifyCode(req, { challengeId, code, purpose }) {
  const store = storeFor(req);
  const rec = await store.bump(challengeId);

  if (!rec || rec.purpose !== purpose) return { ok: false, message: GENERIC_BAD_CODE };

  if (new Date(rec.expiresAt).getTime() <= Date.now()) {
    await store.remove(challengeId);
    return { ok: false, message: GENERIC_BAD_CODE };
  }

  if (rec.attempts > MAX_ATTEMPTS) {
    await store.remove(challengeId);
    return { ok: false, message: "Too many wrong codes. Please start again." };
  }

  if (!/^\d{6}$/.test(code) || !sameHash(rec.codeHash, hashCode(challengeId, code))) {
    return { ok: false, message: GENERIC_BAD_CODE };
  }

  // Delete first; if two requests race with the right code, only one wins.
  if (!(await store.remove(challengeId))) return { ok: false, message: GENERIC_BAD_CODE };

  return { ok: true, adminId: rec.adminId };
}

// Decides whether "Resend code" is allowed for an open sign-in.
async function prepareResend(req, { challengeId }) {
  const rec = await storeFor(req).get(challengeId);

  if (!rec || new Date(rec.expiresAt).getTime() <= Date.now()) {
    return { ok: false, status: 400, message: "This code has expired. Please start again." };
  }
  if (Date.now() - new Date(rec.createdAt).getTime() < RESEND_COOLDOWN_MS) {
    return { ok: false, status: 429, message: "Please wait a few seconds before asking for another code." };
  }
  if (rec.resendCount >= MAX_RESENDS) {
    return { ok: false, status: 429, message: "Too many resend requests. Please start again." };
  }

  return { ok: true, adminId: rec.adminId, purpose: rec.purpose, resendCount: rec.resendCount };
}

// Used to stop someone from flooding the admin inbox with reset emails.
async function latestCode(req, { adminId, purpose }) {
  return storeFor(req).latestFor(adminId, purpose);
}

// Throws away a code that could not be emailed.
async function discardCode(req, challengeId) {
  await storeFor(req).remove(challengeId);
}

module.exports = {
  CODE_TTL_MS,
  RESEND_COOLDOWN_MS,
  issueCode,
  verifyCode,
  prepareResend,
  latestCode,
  discardCode,
};
