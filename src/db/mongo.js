const { MongoClient } = require("mongodb");
const { mongoUri, dbName } = require("../config/env");

const client = new MongoClient(mongoUri);
const db = client.db(dbName);

const collections = {
  siteContent: db.collection("site_content"),
  inquiries: db.collection("inquiries"),
};

async function initMongo() {
  await client.connect();
  await collections.inquiries.createIndex({ id: 1 }, { unique: true });
  await collections.inquiries.createIndex({ createdAt: -1 });
}

module.exports = {
  client,
  db,
  collections,
  initMongo,
};
