const express = require("express");
const bodyParser = require("body-parser");
const { engine } = require("express-handlebars");
const passport = require("passport");
require("./strategies/local-strategy.mjs");
const path = require("path");
var logger = require("morgan");
const auth_controller = require("./controllers/auth_controller");
var cookieParser = require("cookie-parser");
var expressSession = require("express-session");
const jwt = require("jsonwebtoken");
const real_chat_controller = require("./controllers/real_chat_controller");
const room_controller = require("./controllers/room_controller");
const app = express();
app.engine(".hbs", engine({ defaultLayout: "layout", extname: ".hbs" }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(expressSession({ secret: "keyboard cat" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
const startWebSocketServer = require("./websocket");
startWebSocketServer(app);
var pg = require("pg");
const config = {
  user: "wad2231iad4_owner",
  database: "wad2231iad4",
  password: "nUfCRobs1Vx8",
  host: "ep-purple-mountain-a1fmms8d.ap-southeast-1.aws.neon.tech",
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
};
pool = new pg.Pool(config);

app.use(passport.initialize());

const authenticateJWT = passport.authenticate("jwt", {
  session: false,
  resave: false,
  saveUninitialized: true,
});

app.get("/login", (req, res) => {
  res.render("tie_tac_toe/login");
});
app.post("/login", async (req, res) => {
  var { token, username } = await auth_controller.login(req, res);
  if (token) {
    res.cookie("jwt", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    });
    res.cookie("username", username, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    });
    res.redirect("/rooms");
    return;
  }
  res.redirect("/login", { message: "Wrong username or password" });
});
app.get("/register", (req, res) => {
  res.render("tie_tac_toe/register");
});
app.get("/profile", async (req, res) => {
  var user = await auth_controller.getByUsername(req, res);
  if (!user) {
    res.redirect("/login");
  }
  res.render("tie_tac_toe/profile", { user: user });
});
app.post("/profile", async (req, res) => {
  var user = await auth_controller.updateProfile(req, res);
  if (!user) {
    res.redirect("/login");
  }
  res.render("tie_tac_toe/profile", { user: user });
});
app.post("/register", async (req, res) => {
  var { token, username } = await auth_controller.register(req, res);
  res.cookie("jwt", token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 3600000,
  });
  res.cookie("username", username, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 3600000,
  });
  res.redirect("/rooms");
});
app.get("/rooms", authenticateJWT, async (req, res) => {
  const onlineUsers = await auth_controller.allOnlineUsers(req, res);
  const rooms = await room_controller.getAllRooms(req, res);
  console.log("rooms " + rooms);
  res.render("tie_tac_toe/waiting_room", {
    onlineUsers: onlineUsers,
    gameTables: rooms,
  });
});
app.get("/create-rooms", authenticateJWT, async (req, res) => {
  res.render("tie_tac_toe/create_table");
});
app.post("/create-rooms", authenticateJWT, async (req, res) => {
  var { message, status, room } = await room_controller.createRoom(req, res);
  if (!room) {
    res.redirect("/create-rooms", { message: "Create room failed" });
  }
  if (status != 200) {
    res.render("tie_tac_toe/create_table", { message: message });
    return;
  }
  res.redirect("/rooms/game/" + room.id);
});
app.get("/rooms/game/:id", authenticateJWT, async (req, res) => {
  var room = await room_controller.getRoomByUsername(req, res);
  if (room && room.id == req.params.id) {
    res.render("tie_tac_toe/play", { isOwner: true, room: room });
    return;
  }
  res.render("tie_tac_toe/play", { isOwner: false, room: room });
});
app.get("/leaderboard", authenticateJWT, async (req, res) => {
  var room = await room_controller.getRoomByUsername(req, res);
  if (room) {
    res.redirect("/rooms/game/" + room.id);
    return;
  }
  res.render("tie_tac_toe/leader_board", { message: "You don't have a room" });
});
app.get("/logout", authenticateJWT, async (req, res) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  const decoded = jwt.verify(
    token,
    "16f20737f84f2a1691f22a732b0a2e52342ea1e313432fe7d673df8b438fae7403d28fe5beefc5c7b87794730ef917a613b40fbbd7d05a4f3f2f10d650e531acc453f1138b59ea564c5c03e4ae906e01172e427781ff82baf3454bef1eec21971a7f75eb055619637850cb24f4e5d170db6f2e6fca8d0505905c4445951f4e17eb2c2ee9e1fd90d6a98bd13a3653aecec3251435a646473e8bb002254ac6d781ec249efb646d9266f4a1e4576786067f286acf88c354ab2226a87f0136833ff922323f3ff8e87d2c71ea6ec7f795c814cf8d5ae36dc4328bf35243282d9032db9135ced698e39a219cbc606ab1707ca34722ed18efe7c207bb091e3081d6a197"
  );
  const userId = decoded.userId;

  res.clearCookie("jwt", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.clearCookie("username", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  var update = await auth_controller.logout(userId);
  res.redirect("/login");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
