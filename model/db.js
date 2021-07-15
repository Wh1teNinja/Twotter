const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const usernameRegex = /^\w{4,32}$/;
const passwordRegex = /^[\w,./!@#$%^&*?]{8,64}$/;

let userSchema = new Schema({
  username: {
    unique: true,
    type: String,
  },
  password: String,
});

let chatSchema = new Schema({
  users: [String],
  messages: [{ author: String, text: String, date: Date }],
});

let twotSchema = new Schema({
  author: String,
  text: String,
  date: Date,
});

let Users;
let Chats;
let Twots;

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
      Users = db.model("users", userSchema);
      Chats = db.model("chats", chatSchema);
      Twots = db.model("twots", twotSchema);
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

/**
 * @desc Validates user registration data and return appropriate messages if something is not correct
 * @rejects messages array with explanation what went wrong if some of the validation fails
 * @params object data need to contain username, password and confirmPassword
 */
const validateUserRegistrationData = (data) => {
  return new Promise((resolve, reject) => {
    // stores error message if something doesn't satisfy requirements
    const messages = [];

    const { username, password, confirmPassword } = data;

    if (!username)
      messages.push({ field: "username", message: "Username required" });
    if (!password)
      messages.push({ field: "password", message: "Password required" });
    if (!confirmPassword)
      messages.push({
        field: "confirmPassword",
        message: "Password confirmation required",
      });

    if (messages.length) reject(messages);

    if (username < 4 || username > 32)
      messages.push({
        field: "username",
        message: "Username should be from 4 and up to 32 characters long",
      });
    else if (!usernameRegex.test(username))
      messages.push({
        field: "username",
        message:
          "Username should contain only letters, digits and _(underscore) symbol",
      });

    if (password.length < 8 || password.length > 64)
      messages.push({
        field: "password",
        message: "Password should be from 8 and up to 64 characters long",
      });
    else if (!passwordRegex.test(password))
      messages.push({
        field: "password",
        message:
          "Password should contain only letters, digits and _,./!@#$%^&*? symbols",
      });

    if (password !== confirmPassword)
      messages.push({ field: "confirmPassword", message: "Passwords don't match" });

    if (messages.length === 0) resolve();
    else reject(messages);
  });
};

/**
 * @desc Generates salt and hashes password, then saves user to the database.
 * @params object data need to contain username and password
 */
module.exports.addUser = (data) => {
  return new Promise(async (resolve, reject) => {
    validateUserRegistrationData(data)
      .then(() => {})
      .catch((messages) => {
        reject(messages);
      });

    this.getUser({ username: data.username })
      .then(() =>
        reject([{ field: "username", message: "This username is already taken" }])
      )
      .catch(() => {});

    let newUser = new Users(data);

    bcrypt.genSalt(10, (err, salt) => {
      if (err) reject(new Error("Error ocurred generating salt: " + err));
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) reject(new Error("Error ocurred while hashing password: " + err));

        newUser.password = hash;
        newUser.save((err) => {
          if (err) {
            reject(new Error("Error ocurred while saving the user: " + err));
          } else {
            resolve(newUser);
          }
        });
      });
    });
  });
};

module.exports.getChatById = (id) => {
  return new Promise((resolve, reject) => {
    Chats.findById(id)
      .exec()
      .then((chat) => {
        if (chat) {
          resolve(chat.toObject());
        } else {
          reject("Chat not found!");
        }
      })
      .catch((err) => {
        reject(new Error("Error ocurred fetching chat by id: " + err));
      });
  });
};

module.exports.getAllChatsForUser = (user_id) => {
  return new Promise((resolve, reject) => {
    Chats.find({ users: user_id })
      .exec()
      .then((chats) => {
        if (chats) {
          resolve(chats.map((chat) => chat.toObject()));
        } else {
          reject("Chats not found!");
        }
      })
      .catch((err) => {
        reject(new Error("Error ocurred fetching chats for user: " + err));
      });
  });
};

module.exports.addChat = (users) => {
  return new Promise((resolve, reject) => {
    let newChat = new Chats({ users, messages: [] });
    newChat.save((err) => {
      if (err) {
        reject(new Error("Error ocurred while saving the chat: " + err));
      } else {
        resolve(newChat);
      }
    });
  });
};

module.exports.chatAddMessage = (id, author_id, messageText) => {
  return new Promise((resolve, reject) => {
    this.getChatById(id)
      .then((chat) => {
        if (chat.users.includes(author_id)) {
          chat.messages.push({
            author: author_id,
            text: messageText,
            date: new Date(),
          });
          Chats.updateOne({ _id: id }, { $set: chat })
            .exec()
            .then(() => {
              resolve(chat);
            })
            .catch((err) => {
              reject(new Error("Error ocurred updating chat: " + err));
            });
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports.getTwotById = (id) => {
  return new Promise((resolve, reject) => {
    Twots.findById(id)
      .exec()
      .then((twot) => {
        if (twot) {
          resolve(twot.toObject());
        } else {
          reject("Twot not found!");
        }
      })
      .catch((err) => {
        reject(new Error("Error ocurred fetching twot by id: " + err));
      });
  });
};

module.exports.getTwotsAll = () => {
  return new Promise((resolve, reject) => {
    Twots.find()
      .exec()
      .then((twots) => {
        if (twots) {
          resolve(twots.map((twot) => twot.toObject()));
        } else {
          reject("No twots found!");
        }
      })
      .catch((err) => {
        reject(new Error("Error ocurred fetching twot by id: " + err));
      });
  });
};

module.exports.addTwot = (author_id, text) => {
  return new Promise((resolve, reject) => {
    let newTwot = new Twots({ author: author_id, text: text, date: new Date() });
    newTwot.save((err) => {
      if (err) {
        reject(new Error("Error ocurred while saving the twot: " + err));
      } else {
        resolve(newTwot);
      }
    });
  });
};

module.exports.updateTwot = (id, author_id, newText) => {
  return new Promise(async (resolve, reject) => {
    this.getTwotById(id)
      .then((twot) => {
        if (twot.author === author_id) {
          twot.text = newText;
          Twots.updateOne({ _id: id }, { $set: twot })
            .exec()
            .then(() => {
              resolve(twot);
            })
            .catch((err) => {
              reject(new Error("Error ocurred updating twot: " + err));
            });
        } else reject("No permission");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports.deleteTwot = (id, author_id) => {
  return new Promise((resolve, reject) => {
    Twots.deleteOne({ _id: id, author: author_id })
      .exec()
      .then(() => {
        resolve("Deleted successfully");
      })
      .catch((err) => {
        reject(new Error("Error ocurred deleting twot: " + err));
      });
  });
};
