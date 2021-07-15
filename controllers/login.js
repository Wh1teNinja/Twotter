const express = require("express");
const router = express.Router();
const passport = require("passport");

router.post("/", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (user) {
      req.logIn(user, (err) => {
        if (err)  {
          console.log(err);
          res.json({ message: "An error ocurred, try again, please." });
        }
        res.json({ message: "Welcome, " + user.username });
      });
    } else {
      if (err) {
        console.log(err);
        res.json({ message: "An error ocurred, try again, please." });
      } else {
        res.json({ messages: info, message: "Some of data is incorrect." });
      }
    }
  })(req, res, next);
});

module.exports = router;
