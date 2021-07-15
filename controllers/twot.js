const express = require("express");
const router = express.Router();
const passport = require("passport");

// gets all the twots(tweets).
router.get("/", () => {
  db.getTwotsAll()
    .then((twots) => res.json(twots))
    .catch((err) => {
      console.log(err);
      if (err instanceof Error) {
        res.json({ message: "An error ocurred, try again, please." });
      } else {
        res.json({ message: "No twots have been posted yet." });
      }
    });
});

// gets single twot by provided id
router.get("/:id", () => {
  db.getTwotById(req.params.id)
    .then((twot) => res.json(twot))
    .catch((err) => {
      console.log(err);
      if (err instanceof Error) {
        res.json({ message: "An error ocurred, try again, please." });
      } else {
        res.json({ message: "Twot not found." });
      }
    });
});

// updates twot
router.put("/:id", () => {
  db.updateTwot(req.params.id, req.user._id, req.body.text)
    .then((twot) => res.json(twot))
    .catch((err) => {
      console.log(err);
      if (err instanceof Error) {
        res.json({ message: "An error ocurred, try again, please." });
      } else {
        res.json({ message: "Twot not found or no permission to update it." });
      }
    });
});

// adds twot
router.post("/", () => {
  db.addTwot(req.user._id, req.body.text)
    .then((twot) => res.json(twot))
    .catch((err) => {
      console.log(err);
      res.json({ message: "An error ocurred, try again, please." });
    });
});

// deletes twot
router.delete("/:id", () => {
  db.deleteTwot(req.params.id, req.user._id)
    .then((twot) => res.json({ message: "Twot successfully deleted." }))
    .catch((err) => {
      console.log(err);
      if (err instanceof Error) {
        res.json({ message: "An error ocurred, try again, please." });
      } else {
        res.json({ message: "Twot not found or no permission to delete it." });
      }
    });
});

module.exports = router;
