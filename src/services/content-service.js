const { collections } = require("../db/mongo");

const defaultSitePayload = {
  profile: {
    name: "",
    title: "",
    bio: "",
    location: "",
    email: "",
    phone: "",
    logoUrl: "",
    iconUrl: "",
    heroImageUrl: "",
    aboutText: "",
    cvUrl: "",
    whatsappUrl: "",
  },
  socialLinks: [],
  projects: [],
  blogs: [],
  experiences: [],
  skills: [],
  services: [],
  sponsors: [],
  crmRecords: [],
  reviews: [],
};

async function readSitePayload() {
  const doc = await collections.siteContent.findOne({ _id: "default" });
  const payload = doc?.payload && typeof doc.payload === "object" ? doc.payload : {};
  return {
    ...defaultSitePayload,
    ...payload,
    profile: {
      ...defaultSitePayload.profile,
      ...(payload.profile && typeof payload.profile === "object" ? payload.profile : {}),
    },
  };
}

async function writeSitePayload(payload) {
  await collections.siteContent.updateOne(
    { _id: "default" },
    { $set: { payload, updatedAt: new Date() } },
    { upsert: true },
  );
}

module.exports = {
  readSitePayload,
  writeSitePayload,
};
