const path = require("node:path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const nodeEnv = process.env.NODE_ENV || "development";
const port = Number(process.env.PORT || 4000);
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error("MONGODB_URI is required. Set it in backend/.env.");
}

const dbName = process.env.MONGODB_DB_NAME || (() => {
  try {
    const parsed = new URL(mongoUri);
    const fromPath = parsed.pathname.replace("/", "").trim();
    return fromPath || "portfolio_db";
  } catch {
    return "portfolio_db";
  }
})();

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

module.exports = {
  nodeEnv,
  port,
  mongoUri,
  dbName,
  allowedOrigins,
};
