const mongoose = require("mongoose");
const validator = require("validator");

// Links end up in public <a href>, so only real http(s) URLs are accepted (no javascript: etc).
const httpUrl = {
  validator: (v) => !v || validator.isURL(v, { protocols: ["http", "https"], require_protocol: true }),
  message: (props) => `${props.path === "mapUrl" ? "Google Maps link" : "Facebook link"} must be a full https:// address.`,
};

// One document holds the site's contact details shown in the footer and on the Contact page.
// A blank field falls back to the built-in default in frontend/src/siteConfig.js.
const ContactInfoSchema = new mongoose.Schema(
  {
    address: { type: String, trim: true, maxlength: 300 },
    addressBn: { type: String, trim: true, maxlength: 300 }, // optional Bangla address
    mapUrl: { type: String, trim: true, maxlength: 2000, validate: httpUrl },
    phone: { type: String, trim: true, maxlength: 40 },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 200,
      validate: { validator: (v) => !v || validator.isEmail(v), message: "Email must be a valid email address." },
    },
    facebook: { type: String, trim: true, maxlength: 500, validate: httpUrl },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactInfo", ContactInfoSchema);
