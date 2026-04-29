const {
  getInquiries,
  createInquiry,
  updateInquiryById,
  deleteInquiryById,
} = require("../services/inquiry-service");
const { validateInquiryPayload } = require("../validators/inquiry-validator");

async function listInquiries(_req, res) {
  const inquiries = await getInquiries();
  res.json(inquiries);
}

async function addInquiry(req, res) {
  const validated = validateInquiryPayload(req.body, false);
  if (validated.error) return res.status(400).json({ error: validated.error });
  const inquiry = await createInquiry(validated.value);
  return res.status(201).json(inquiry);
}

async function patchInquiry(req, res) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "Inquiry id is required." });

  const validated = validateInquiryPayload(req.body, true);
  if (validated.error) return res.status(400).json({ error: validated.error });

  const updated = await updateInquiryById(id, validated.value);
  if (!updated) return res.status(404).json({ error: "Inquiry not found." });
  return res.json(updated);
}

async function removeInquiry(req, res) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "Inquiry id is required." });
  const deleted = await deleteInquiryById(id);
  if (!deleted) return res.status(404).json({ error: "Inquiry not found." });
  return res.json({ ok: true });
}

module.exports = {
  listInquiries,
  addInquiry,
  patchInquiry,
  removeInquiry,
};
