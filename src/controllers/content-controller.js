const { readSitePayload, writeSitePayload } = require("../services/content-service");

async function getContent(_req, res) {
  const payload = await readSitePayload();
  res.json(payload);
}

async function putContent(req, res) {
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({ error: "Invalid payload." });
  }
  await writeSitePayload(req.body);
  return res.json({ ok: true });
}

async function getHome(_req, res) {
  const payload = await readSitePayload();
  const reviews = Array.isArray(payload.reviews) ? payload.reviews : [];
  res.json({
    profile: payload.profile,
    socialLinks: Array.isArray(payload.socialLinks) ? payload.socialLinks : [],
    projects: Array.isArray(payload.projects) ? payload.projects : [],
    blogs: Array.isArray(payload.blogs) ? payload.blogs : [],
    experiences: Array.isArray(payload.experiences) ? payload.experiences : [],
    skills: Array.isArray(payload.skills) ? payload.skills : [],
    services: Array.isArray(payload.services) ? payload.services : [],
    sponsors: Array.isArray(payload.sponsors) ? payload.sponsors : [],
    reviews: reviews.filter((item) => item && item.approved),
  });
}

async function getProfile(_req, res) {
  const payload = await readSitePayload();
  res.json(payload.profile);
}

async function getContactDetails(_req, res) {
  const payload = await readSitePayload();
  const profile = payload.profile ?? {};
  res.json({
    email: profile.email ?? "",
    phone: profile.phone ?? "",
    location: profile.location ?? "",
  });
}

function sectionGetter(sectionName) {
  return async (_req, res) => {
    const payload = await readSitePayload();
    res.json(Array.isArray(payload[sectionName]) ? payload[sectionName] : []);
  };
}

async function getBlogById(req, res) {
  const payload = await readSitePayload();
  const blogs = Array.isArray(payload.blogs) ? payload.blogs : [];
  const blog = blogs.find((item) => String(item.id) === String(req.params.id));
  if (!blog) return res.status(404).json({ error: "Blog not found." });
  return res.json(blog);
}

module.exports = {
  getContent,
  putContent,
  getHome,
  getProfile,
  getContactDetails,
  getSocialLinks: sectionGetter("socialLinks"),
  getProjects: sectionGetter("projects"),
  getBlogs: sectionGetter("blogs"),
  getBlogById,
  getExperiences: sectionGetter("experiences"),
  getSkills: sectionGetter("skills"),
  getServices: sectionGetter("services"),
  getSponsors: sectionGetter("sponsors"),
  getApprovedReviews: async (_req, res) => {
    const payload = await readSitePayload();
    const reviews = Array.isArray(payload.reviews) ? payload.reviews : [];
    res.json(reviews.filter((item) => item && item.approved));
  },
};
