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

/**
 * @desc Validates user login data and return appropriate messages if something is not correct
 * @rejects messages array with explanation what went wrong if some of the validation fails
 * @params object data need to contain username and password
 */
 const validateUserLogin = (data) => {
  return new Promise((resolve, reject) => {
    let messages = [];

    let { username, password } = data;
    if (!username)
      messages.push({ field: "username", message: "Username required" });
    if (!password)
      messages.push({ field: "password", message: "Password required" });

    if (
      messages.length === 0 &&
      (!usernameRegex.test(username) || !passwordRegex.test(password))
    )
      messages.push({ field: "password", message: "Wrong username or password" });

    if (messages.length === 0) resolve();
    else reject(messages);
  });
};

/**
 * @desc Validates data, fetches user from db, compares passwords, returns user if valid
 * @params object data need to contain username and password
 */
 module.exports.authenticateUser = (data) => {
  return new Promise(async (resolve, reject) => {
    validateUserLogin(data)
      .then(() => {})
      .catch((messages) => {
        reject(messages);
      });

    this.getUser({ username: data.username })
      .then(async (user) => {
        if (await bcrypt.compare(data.password, user.password)) {
          resolve(user);
        } else {
          reject([
            {
              field: "password",
              message: "Wrong username or password",
            },
          ]);
        }
      })
      .catch((err) => {
        reject(new Error("Error ocurred getting user: " + err));
      });
  });
};