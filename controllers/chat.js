const express = require("express");
const router = express.Router();
const db = require("../model/db");

// provides list of user's chats
router.get("/", (req, res) => {
  db.getAllChatsForUser(req.user._id)
    .then((chats) => {
      res.json(chats);
    })
    .catch((err) => {
      console.log(err);
      if (err instanceof Error) {
        res.json({ message: "An error ocurred, try again, please." });
      } else {
        res.json({ message: "No chats have been created yet." });
      }
    });
});

// provides chat history with a certain user
router.get("/:user_id", (req, res) => {
  db.getAllChatsForUser(req.user._id)
    .then((chats) => {
      res.json(
        chats.find((chat) => {
          return chat.users.contains(req.params.user_id);
        })
      );
    })
    .catch((err) => {
      console.log(err);
      if (err instanceof Error) {
        res.json({ message: "An error ocurred, try again, please." });
      } else {
        res.json({ message: "Chat with this user haven't been created yet." });
      }
    });
});

// http post way to send message to a user
router.post("/:user_id", async (req, res) => {
  let chat;

  await db
    .getAllChatsForUser(req.user._id)
    .then((chats) => {
      chat = chats.find((chat) => {
        return chat.users.contains(req.params.user_id);
      });
    })
    .catch((err) => {
      console.log(err);
      if (err instanceof Error) {
        res.json({ message: "An error ocurred, try again, please." });
      } else {
        db.addChat([req.params.user_id, req.user._id]).then((newChat) => {
          chat = newChat;
        });
      }
    });

  db.chatAddMessage(chat._id, req.user._id, req.body.message).then((chat) => {
    res.json(chat);
  }).catch(err => {
    console.log(err);
    res.json({ message: "An error ocurred, try again, please." });
  });
});

module.exports = router;
