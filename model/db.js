const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


module.exports.initialize = () => {
  return new Promise((resolve, reject) => {
    let db = mongoose.createConnection(
      `mongodb+srv://${process.env.DB_LOGIN}:${process.env.DB_PASSWORD}@cluster0.7guft.mongodb.net/twotter?retryWrites=true&w=majority`,
      { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
    );

    db.on("error", (err) => {
      reject(err);
    });

    db.once("open", () => {
      resolve();
    });
  });
};