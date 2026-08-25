/**
 * Admin users often paste a bare email ("info@alexagro.com") or a bare
 * domain ("facebook.com/alexagro") into a link field instead of a full
 * "mailto:" or "https://" URL. A bare value used directly as an <a href>
 * gets treated as a path *relative to the current page* by the browser,
 * which is exactly what caused the "page not found" bug — clicking it
 * just navigated to a route inside our own React app that doesn't exist.
 *
 * This normalizes any link value before it's used in an href, so the
 * admin panel doesn't need to teach every user to type "mailto:"/"https://".
 *
 * Email targets open a Gmail compose box in a new tab rather than
 * "mailto:". A mailto: link only works if the browser can hand off to an
 * OS-registered mail app — that's missing entirely in preview contexts
 * like VS Code's Simple Browser (it just shows a blank tab with the
 * mailto: URL, as seen while testing), so it silently does nothing there.
 * A regular https:// link to Gmail's compose screen opens an actual
 * "send email" box in any browser context, no OS mail app required.
 */
function gmailComposeLink(email) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
}

export function normalizeLink(value) {
  if (!value) return "#";
  const trimmed = String(value).trim();
  if (!trimmed) return "#";

  // Explicit mailto: — pull out the address and route through Gmail compose.
  const mailtoMatch = trimmed.match(/^mailto:(.+)$/i);
  if (mailtoMatch) {
    return gmailComposeLink(mailtoMatch[1].split("?")[0]);
  }

  // Already a proper absolute/protocol link, an in-app path, or an anchor.
  if (/^(https?:|tel:|whatsapp:|\/|#)/i.test(trimmed)) {
    return trimmed;
  }

  // Looks like a bare email address.
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return gmailComposeLink(trimmed);
  }

  // Looks like a bare phone number (digits, spaces, +, -).
  if (/^[+\d][\d\s-]{6,}$/.test(trimmed)) {
    return `tel:${trimmed.replace(/\s+/g, "")}`;
  }

  // Otherwise assume it's a bare domain/URL missing its protocol.
  return `https://${trimmed}`;
}

export { gmailComposeLink };
