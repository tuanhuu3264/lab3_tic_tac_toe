const Message = require("../models/real_chat");

exports.sendMessage = async (content, idPlayer) => {
  const newMessage = await Message.insertMessage(content, idPlayer);
  if (newMessage) {
    return newMessage;
  } else throw new Error("Register failed");
};
