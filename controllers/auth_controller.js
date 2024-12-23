const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const JWT_SECRET =
  "16f20737f84f2a1691f22a732b0a2e52342ea1e313432fe7d673df8b438fae7403d28fe5beefc5c7b87794730ef917a613b40fbbd7d05a4f3f2f10d650e531acc453f1138b59ea564c5c03e4ae906e01172e427781ff82baf3454bef1eec21971a7f75eb055619637850cb24f4e5d170db6f2e6fca8d0505905c4445951f4e17eb2c2ee9e1fd90d6a98bd13a3653aecec3251435a646473e8bb002254ac6d781ec249efb646d9266f4a1e4576786067f286acf88c354ab2226a87f0136833ff922323f3ff8e87d2c71ea6ec7f795c814cf8d5ae36dc4328bf35243282d9032db9135ced698e39a219cbc606ab1707ca34722ed18efe7c207bb091e3081d6a197";

exports.login = async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const { user, token } = await User.login(username, password);

  if (user) {
    const update = await User.updateField(user.id, "is_active", true);
    const payload = {
      userId: user.id,
      username: user.username,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
    console.log(token);
    console.log(user);
    return { token: token, username: user.username };
  } else return null;
};

exports.logout = async (id) => {
  const update = await User.updateField(id, "is_active", false);
  return update;
};
exports.register = async (req, res) => {
  const username = req.body.username;
  const usernameLowCase = username.toLowerCase();

  const flag = await User.checkUsername(usernameLowCase);
  if (flag) {
    throw new Error("Username already exists");
  }
  const fullname = req.body.fullname;
  const password = req.body.password;
  const newUser = await User.register(username, fullname, password);
  if (newUser) {
    const payload = {
      userId: newUser.id,
      username: newUser.username,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
    console.log(token);
    console.log(newUser);
    return { token: token, username: newUser.username };
  } else throw new Error("Register failed");
};
exports.getByUsername = async (req, res) => {
  const username = req.cookies?.username;
  console.log(username);
  if (!username) {
    return null;
  }
  const user = await User.getUserByUserName(username);
  console.log(user);
  if (!user) return null;
  return user;
};
exports.allOnlineUsers = async (req, res) => {
  const users = await User.getAllActivedUsers();
  return users;
};
exports.updateProfile = async (req, res) => {
  const avatar = req.body.avatar;
  const fullname = req.body.fullname;
  const username = req.cookies?.username;
  const updateAvatar = await User.updateFieldByUsername(
    username,
    "avatar",
    avatar
  );
  if (!updateAvatar) return null;
  const updateFullname = await User.updateFieldByUsername(
    username,
    "fullname",
    fullname
  );
  if (!updateFullname) return null;
  return updateFullname;
};
