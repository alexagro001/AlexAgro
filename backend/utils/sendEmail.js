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
    // Prevent the transporter from hanging forever when the SMTP server
    // is unreachable — the form must always respond, even if the
    // notification email can't be delivered.
    connectionTimeout: 8000,
    socketTimeout: 8000,
    greetingTimeout: 8000,
  });
}

async function sendWithTimeout(transporter, mailOptions, label) {
  // Race the send against an 8s timeout so a dead SMTP server can never
  // block the request — the CV is already saved to disk by this point.
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`${label} timed out`)), 8000)
  );
  try {
    await Promise.race([transporter.sendMail(mailOptions), timeout]);
    return true;
  } catch (e) {
    console.warn(`${label} failed:`, e.message);
    return false;
  }
}

// Sends every contact-form submission straight to the company inbox
// (CONTACT_RECEIVER_EMAIL) and also confirms receipt to the sender.
async function sendContactEmail({ name, email, phone, subject, message }) {
  const transporter = buildTransporter();
  if (!transporter) {
    console.warn("Email not sent: SMTP_HOST / SMTP_USER / SMTP_PASS are not set");
    return { sent: false, reason: "smtp-not-configured" };
  }

  const receiver = process.env.CONTACT_RECEIVER_EMAIL || process.env.SMTP_USER;

  const sent = await sendWithTimeout(
    transporter,
    {
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
    },
    "Contact notification email"
  );

  // Best-effort confirmation to the person who submitted the form.
  if (sent) {
    await sendWithTimeout(
      transporter,
      {
        from: `"Alex Agro" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "We received your message",
        html: `<p>Hi ${name},</p><p>Thanks for reaching out. Our team will get back to you shortly.</p>`,
      },
      "Contact confirmation email"
    );
  }

  return { sent };
}

// Notifies the company inbox whenever someone submits a CV through the
// Career page, with a direct link to download/view the CV.
// Fire-and-forget: the CV is already saved to disk, so the response is
// sent immediately and the notification email runs in the background.
async function sendCareerApplicationEmail({ fullName, email, cvUrl }) {
  const transporter = buildTransporter();
  if (!transporter) {
    console.warn("Email not sent: SMTP_HOST / SMTP_USER / SMTP_PASS are not set");
    return { sent: false, reason: "smtp-not-configured" };
  }

  const receiver = process.env.CONTACT_RECEIVER_EMAIL || process.env.SMTP_USER;

  await sendWithTimeout(
    transporter,
    {
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
    },
    "Career application notification email"
  );

  return { sent: true };
}

// Emails the 6-digit admin sign-in code (or the password-reset code) to the
// admin address. Unlike the notification emails above, the caller must know
// whether it was delivered, because the person cannot continue without it.
async function sendAdminCodeEmail({ to, code, purpose, minutes = 5 }) {
  const transporter = buildTransporter();
  if (!transporter) {
    console.warn("Email not sent: SMTP_HOST / SMTP_USER / SMTP_PASS are not set");
    return { sent: false, reason: "smtp-not-configured" };
  }

  const isReset = purpose === "reset";
  const sent = await sendWithTimeout(
    transporter,
    {
      from: `"Alex Agro Admin" <${process.env.SMTP_USER}>`,
      to,
      subject: isReset ? "Your Alex Agro password reset code" : "Your Alex Agro admin login code",
      text: `Your ${isReset ? "password reset" : "admin login"} code is ${code}. It expires in ${minutes} minutes. If this wasn't you, ignore this email and change your admin password.`,
      html: `
        <h2>${isReset ? "Password reset code" : "Admin login code"}</h2>
        <p>Your code is:</p>
        <p style="font-size:28px;letter-spacing:6px;font-weight:bold;">${code}</p>
        <p>It expires in ${minutes} minutes and works only once.</p>
        <p>If this wasn't you, ignore this email and change your admin password.</p>
      `,
    },
    "Admin code email"
  );

  return { sent, reason: sent ? undefined : "send-failed" };
}

module.exports = { sendContactEmail, sendCareerApplicationEmail, sendAdminCodeEmail };