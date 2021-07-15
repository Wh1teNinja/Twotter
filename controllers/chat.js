const express = require("express");
const router = express.Router();
const db = require("../model/db");

// provides list of user's chats
router.get("/", (req, res) => {});

// provides chat history with a certain user
router.get("/:user_id", (req, res) => {});

// http post way to send message to a user
router.post("/:user_id", async (req, res) => {});

module.exports = router;
