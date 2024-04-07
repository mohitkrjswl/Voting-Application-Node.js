const mongoose = require("mongoose");
require('dotenv').config();
// define the MongoDB connection URL

const mongoURL = process.env.MONGODB_URL_LOCAL;
// const mongoURL = process.env.DB_URL;



mongoose.connect(mongoURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("connected", () => {
  console.log("MongoDB connected");
});
db.on("error", (err) => {
  console.error("MongoDB connections error: ", err);
});
db.on("disconnected", () => {
  console.log("MongoDB disconnected");
});
module.exports = db;