const db = require("../model/db");

// socket routes
module.exports.initialize = async (socket) => {
  var userId = socket.request.session.passport.user;

  if (!userId) return;

  db.getAllChatsForUser(userId).then(chats => {
    for (let i = 0; i < chats.length; i++) {
      socket.join(chat._id);
    }
  }).catch((err) => {socket.emit("server-message", err)});
  
  socket.on("send-message", (chat_id, messageText) => {
    db.chatAddMessage(chat_id, userId, messageText).then(() =>{
      io.to(chat_id).emit("message", chat.messages[chat.messages.length - 1]);
    }).catch(err => {
      socket.emit("server-message", err);
    });
  });
};