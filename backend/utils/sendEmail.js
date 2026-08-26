const nodemailer = require("nodemailer");

function buildTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null; // email not configured yet
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: String(process.env.SMTP_SECURE) === "true", // true for port 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Sends every contact-form submission straight to the company inbox
// (CONTACT_RECEIVER_EMAIL) and also confirms receipt to the sender.
async function sendContactEmail({ name, email, phone, subject, message }) {
  const transporter = buildTransporter();

  if (!transporter) {
    console.warn(
      "Email not sent: SMTP_HOST / SMTP_USER / SMTP_PASS are not set in backend/.env"
    );
    return { sent: false, reason: "smtp-not-configured" };
  }

  const receiver = process.env.CONTACT_RECEIVER_EMAIL || process.env.SMTP_USER;

  try {
    await transporter.sendMail({
      from: `"Website Contact Form" <${process.env.SMTP_USER}>`,
      to: receiver,
      replyTo: email,
      subject: `New website inquiry: ${subject || "General inquiry"}`,
      html: `
        <h2>New contact form submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "-"}</p>
        <p><strong>Subject:</strong> ${subject || "-"}</p>
        <p><strong>Message:</strong></p>
        <p>${String(message).replace(/\n/g, "<br/>")}</p>
      `,
    });
  } catch (e) {
    console.warn("Contact notification email failed:", e.message);
    return { sent: false, reason: "send-failed" };
  }

  // Best-effort confirmation to the person who submitted the form.
  try {
    await transporter.sendMail({
      from: `"Alex Agro" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "We received your message",
      html: `<p>Hi ${name},</p><p>Thanks for reaching out. Our team will get back to you shortly.</p>`,
    });
  } catch (e) {
    console.warn("Confirmation email to sender failed:", e.message);
  }

  return { sent: true };
}

// Notifies the company inbox whenever someone submits a CV through the
// Career page, with a direct link to download/view the CV.
async function sendCareerApplicationEmail({ fullName, email, cvUrl }) {
  const transporter = buildTransporter();

  if (!transporter) {
    console.warn(
      "Email not sent: SMTP_HOST / SMTP_USER / SMTP_PASS are not set in backend/.env"
    );
    return { sent: false, reason: "smtp-not-configured" };
  }

  const receiver = process.env.CONTACT_RECEIVER_EMAIL || process.env.SMTP_USER;

  try {
    await transporter.sendMail({
      from: `"Website Career Application" <${process.env.SMTP_USER}>`,
      to: receiver,
      replyTo: email,
      subject: `New CV submission: ${fullName}`,
      html: `
        <h2>New career application</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>CV:</strong> <a href="${cvUrl}">Download / View CV</a></p>
      `,
    });
  } catch (e) {
    console.warn("Career application notification email failed:", e.message);
    return { sent: false, reason: "send-failed" };
  }

  return { sent: true };
}

module.exports = { sendContactEmail, sendCareerApplicationEmail };