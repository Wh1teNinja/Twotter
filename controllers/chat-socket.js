const db = require("../model/db");

// socket routes
module.exports.initialize = async (socket) => {
  var userId = socket.request.session.passport.user;

  if (!userId) return;
};