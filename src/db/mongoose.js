const mongoose = require("mongoose");
const dbURL = process.env.MONGO_DB_URL;

mongoose.connect(dbURL, {
  useNewUrlParser: true,
  useCreateIndex: true,
});
