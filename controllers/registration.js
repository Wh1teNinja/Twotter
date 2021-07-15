const express = require("express");
const passport = require("passport");
const db = require("../model/db");
const router = express.Router();

router.post("/", (req, res) => {
  let data = req.body;

  db.addUser(data)
    .then((user) => {
      res.json({ message: "Registration successful, " + user.username });
    })
    .catch((err) => {
      if (err instanceof Error) {
        console.log(err);
        res.json({ message: "An error ocurred, try again, please." });
      } else {
        res.json({ messages: err, message: "Some of data is incorrect." });
      }
    });
});

module.exports = router;
