const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const crypto = require("node:crypto");
const compression = require("compression");
const helmet = require("helmet");
const morgan = require("morgan");
const { MongoClient } = require("mongodb");

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const mongoUri = process.env.MONGODB_URI;
const nodeEnv = process.env.NODE_ENV || "development";
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

if (!mongoUri) {
  throw new Error("MONGODB_URI is required. Set it in backend/.env.");
}

const client = new MongoClient(mongoUri);
const dbName = process.env.MONGODB_DB_NAME || (() => {
  try {
    const parsed = new URL(mongoUri);
    const fromPath = parsed.pathname.replace("/", "").trim();
    return fromPath || "portfolio_db";
  } catch {
    return "portfolio_db";
  }
})();
const db = client.db(dbName);
const siteContentCollection = db.collection("site_content");
const inquiriesCollection = db.collection("inquiries");

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

function asyncHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

function sanitizeText(value, maxLength) {
  const text = String(value ?? "").trim();
  if (!text) {
    return null;
  }
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

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "portfolio-backend",
    message: "Backend is running.",
    endpoints: [
      "GET /health",
      "GET /api/content",
      "PUT /api/content",
      "GET /api/inquiries",
      "POST /api/inquiries",
      "PATCH /api/inquiries/:id",
      "DELETE /api/inquiries/:id",
    ],
  });
});

async function initSchema() {
  await client.connect();
  await inquiriesCollection.createIndex({ id: 1 }, { unique: true });
  await inquiriesCollection.createIndex({ createdAt: -1 });
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "portfolio-backend",
    environment: nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/content", asyncHandler(async (_req, res) => {
  const doc = await siteContentCollection.findOne({ _id: "default" });
  res.json(doc?.payload ?? {});
}));

app.put("/api/content", asyncHandler(async (req, res) => {
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({ error: "Invalid payload." });
  }
  await siteContentCollection.updateOne(
    { _id: "default" },
    { $set: { payload: req.body, updatedAt: new Date() } },
    { upsert: true },
  );
  return res.json({ ok: true });
}));

app.get("/api/inquiries", asyncHandler(async (_req, res) => {
  const docs = await inquiriesCollection.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
  res.json(
    docs.map((doc) => ({
      id: String(doc.id),
      name: String(doc.name),
      email: String(doc.email),
      message: String(doc.message),
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
      approved: Boolean(doc.approved),
    })),
  );
}));

app.post("/api/inquiries", asyncHandler(async (req, res) => {
  const validated = validateInquiryPayload(req.body, false);
  if (validated.error) {
    return res.status(400).json({ error: validated.error });
  }
  const { name, email, message } = validated.value;

  const inquiry = {
    id: crypto.randomUUID(),
    name,
    email,
    message,
    approved: false,
    createdAt: new Date(),
  };

  await inquiriesCollection.insertOne(inquiry);
  return res.status(201).json({
    ...inquiry,
    createdAt: inquiry.createdAt.toISOString(),
  });
}));

app.patch("/api/inquiries/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Inquiry id is required." });
  }
  const current = await inquiriesCollection.findOne({ id });
  if (!current) {
    return res.status(404).json({ error: "Inquiry not found." });
  }

  const validated = validateInquiryPayload(req.body, true);
  if (validated.error) {
    return res.status(400).json({ error: validated.error });
  }

  await inquiriesCollection.updateOne(
    { id },
    { $set: validated.value },
  );

  return res.json({
    id: current.id,
    name: validated.value.name ?? current.name,
    email: validated.value.email ?? current.email,
    message: validated.value.message ?? current.message,
    approved: validated.value.approved ?? Boolean(current.approved),
    createdAt: current.createdAt instanceof Date ? current.createdAt.toISOString() : String(current.createdAt),
  });
}));

app.delete("/api/inquiries/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Inquiry id is required." });
  }
  const result = await inquiriesCollection.deleteOne({ id });
  if (!result.deletedCount) {
    return res.status(404).json({ error: "Inquiry not found." });
  }
  return res.json({ ok: true });
}));

app.use((error, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error("Unhandled backend error:", error);
  res.status(500).json({ error: "Internal server error." });
});

initSchema()
  .then(() => {
    const maxPortAttempts = 20;
    const startServer = (targetPort, attemptsLeft = maxPortAttempts) => {
      const server = app.listen(targetPort, () => {
        // eslint-disable-next-line no-console
        console.log(`Express backend running at http://localhost:${targetPort} (MongoDB)`);
      });

      server.on("error", (error) => {
        if (error && error.code === "EADDRINUSE" && attemptsLeft > 0) {
          // eslint-disable-next-line no-console
          console.warn(`Port ${targetPort} is in use. Trying ${targetPort + 1}...`);
          startServer(targetPort + 1, attemptsLeft - 1);
          return;
        }
        // eslint-disable-next-line no-console
        console.error("Server failed to listen:", error);
        process.exit(1);
      });
    };

    startServer(port);
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Failed to start backend:", error);
    process.exit(1);
  });
