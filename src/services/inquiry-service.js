const crypto = require("node:crypto");
const { collections } = require("../db/mongo");

async function getInquiries() {
  const docs = await collections.inquiries
    .find({}, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .toArray();

  return docs.map((doc) => ({
    id: String(doc.id),
    name: String(doc.name),
    email: String(doc.email),
    message: String(doc.message),
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
    approved: Boolean(doc.approved),
  }));
}

async function createInquiry({ name, email, message }) {
  const inquiry = {
    id: crypto.randomUUID(),
    name,
    email,
    message,
    approved: false,
    createdAt: new Date(),
  };
  await collections.inquiries.insertOne(inquiry);
  return { ...inquiry, createdAt: inquiry.createdAt.toISOString() };
}

async function updateInquiryById(id, patch) {
  const current = await collections.inquiries.findOne({ id });
  if (!current) return null;
  await collections.inquiries.updateOne({ id }, { $set: patch });
  return {
    id: current.id,
    name: patch.name ?? current.name,
    email: patch.email ?? current.email,
    message: patch.message ?? current.message,
    approved: patch.approved ?? Boolean(current.approved),
    createdAt: current.createdAt instanceof Date ? current.createdAt.toISOString() : String(current.createdAt),
  };
}

async function deleteInquiryById(id) {
  const result = await collections.inquiries.deleteOne({ id });
  return Boolean(result.deletedCount);
}

module.exports = {
  getInquiries,
  createInquiry,
  updateInquiryById,
  deleteInquiryById,
};
