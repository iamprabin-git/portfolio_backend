function sanitizeText(value, maxLength) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  return text.slice(0, maxLength);
}

function validateInquiryPayload(payload, partial = false) {
  const next = {};
  const name = sanitizeText(payload?.name, 120);
  const email = sanitizeText(payload?.email, 180);
  const message = sanitizeText(payload?.message, 5000);

  if (!partial || payload?.name !== undefined) {
    if (!name) return { error: "name is required." };
    next.name = name;
  }
  if (!partial || payload?.email !== undefined) {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "valid email is required." };
    next.email = email.toLowerCase();
  }
  if (!partial || payload?.message !== undefined) {
    if (!message) return { error: "message is required." };
    next.message = message;
  }
  if (payload?.approved !== undefined) {
    next.approved = Boolean(payload.approved);
  }
  return { value: next };
}

module.exports = { validateInquiryPayload };
