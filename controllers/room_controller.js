const Room = require("../models/room");
const User = require("../models/user");
exports.getAllRooms = async (req, res) => {
  const rooms = await Room.getAllRooms();
  return rooms;
};

exports.createRoom = async (req, res) => {
  const { type, size } = req.body;
  const username = req.cookies?.username;
  if (!username) {
    return null;
  }
  console.log(username);
  const user = await User.getUserByUserName(username);
  if (!user) return null;
  const existedRoom = await Room.findByOwnerId(user.id);
  if (existedRoom)
    return {
      message: "There is a exist your room.",
      status: 500,
      room: existedRoom,
    };
  const room = await Room.insertRoom(user.id, type, size);
  return { message: "", status: 200, room: room };
};
exports.getRoomByUsername = async (req, res) => {
  const username = req.cookies?.username;
  if (!username) {
    return null;
  }
  const user = await User.getUserByUserName(username);
  if (!user) return null;
  const existedRoom = await Room.findByOwnerId(user.id);
  return existedRoom;
};
