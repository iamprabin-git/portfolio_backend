const express = require("express");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const morgan = require("morgan");
const { nodeEnv, allowedOrigins } = require("./config/env");
const { publicRouter } = require("./routes/public-routes");
const { notFound, errorHandler } = require("./middleware/error-handler");

const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Blocked by CORS policy."));
    },
  }),
);
app.use(morgan(nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "2mb" }));

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "portfolio-backend",
    message: "Backend is running.",
    endpoints: [
      "GET /health",
      "GET /api/content",
      "GET /api/home",
      "GET /api/profile",
      "GET /api/contact-details",
      "GET /api/social-links",
      "GET /api/projects",
      "GET /api/blogs",
      "GET /api/blogs/:id",
      "GET /api/experiences",
      "GET /api/skills",
      "GET /api/services",
      "GET /api/sponsors",
      "GET /api/reviews",
      "PUT /api/content",
      "GET /api/inquiries",
      "POST /api/inquiries",
      "PATCH /api/inquiries/:id",
      "DELETE /api/inquiries/:id",
    ],
  });
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "portfolio-backend",
    environment: nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", publicRouter);
app.use(notFound);
app.use(errorHandler);

module.exports = { app };
