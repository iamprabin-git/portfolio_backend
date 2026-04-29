const express = require("express");
const { asyncHandler } = require("../middleware/async-handler");
const content = require("../controllers/content-controller");
const inquiry = require("../controllers/inquiry-controller");

const router = express.Router();

router.get("/content", asyncHandler(content.getContent));
router.put("/content", asyncHandler(content.putContent));
router.get("/home", asyncHandler(content.getHome));
router.get("/profile", asyncHandler(content.getProfile));
router.get("/contact-details", asyncHandler(content.getContactDetails));
router.get("/social-links", asyncHandler(content.getSocialLinks));
router.get("/projects", asyncHandler(content.getProjects));
router.get("/blogs", asyncHandler(content.getBlogs));
router.get("/blogs/:id", asyncHandler(content.getBlogById));
router.get("/experiences", asyncHandler(content.getExperiences));
router.get("/skills", asyncHandler(content.getSkills));
router.get("/services", asyncHandler(content.getServices));
router.get("/sponsors", asyncHandler(content.getSponsors));
router.get("/reviews", asyncHandler(content.getApprovedReviews));

router.get("/inquiries", asyncHandler(inquiry.listInquiries));
router.post("/inquiries", asyncHandler(inquiry.addInquiry));
router.patch("/inquiries/:id", asyncHandler(inquiry.patchInquiry));
router.delete("/inquiries/:id", asyncHandler(inquiry.removeInquiry));

module.exports = { publicRouter: router };
