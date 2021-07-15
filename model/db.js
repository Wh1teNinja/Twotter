const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

let userSchema = new Schema({
  username: {
    unique: true,
    type: String,
  },
  password: String,
});

let Users;

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

/**
 * @desc finds user with matching data provided
 * @params object data can contain any user data that we want to search by
 */
 module.exports.getUser = (data) => {
  return new Promise((resolve, reject) => {
    Users.findOne(data)
      .exec()
      .then((user) => {
        if (user) {
          resolve(user.toObject());
        } else {
          reject("User Not Found!");
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * @desc finds user with matching id
 */
module.exports.getUserById = (id) => {
  return new Promise((resolve, reject) => {
    Users.findById(id)
      .exec()
      .then((user) => {
        if (user) {
          resolve(user.toObject());
        } else {
          reject("User Not Found!");
        }
      });
  }).catch((err) => {
    reject(err);
  });
};