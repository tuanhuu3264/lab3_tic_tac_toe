// **Project Requirements: Game Server and Auth Server**

// Import required modules
const express = require("express");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const Handlebars = require("express-handlebars");

// **1. Server Configuration**
// Load environment variables from .env file
dotenv.config();

const gamePort = process.env.GAME_PORT || 22213; // Example: MSSV 2212013 -> port 22213
const authPort = process.env.AUTH_PORT || 53003; // Fixed port for Auth server
const dbConfig = {
  host: "localhost",
  port: process.env.DB_PORT || 52433, // Default database port
  database: "wad2231ia4",
};

// **2. Authentication Server Setup**
const authServer = express();
authServer.use(express.json());

// Passport configuration for JWT
authServer.use(passport.initialize());
require("./config/passport")(passport);

// HTTPS enforcement (placeholder for actual SSL setup)
authServer.use((req, res, next) => {
  if (req.protocol !== "https") {
    return res.status(403).send("HTTPS required");
  }
  next();
});

// Authentication endpoints
authServer.post("/register", (req, res) => {
  const { nickname, fullname, avatar } = req.body;
  // TODO: Save user data securely to the database
  res.send({ message: "User registered successfully" });
});

authServer.post("/login", (req, res) => {
  const { nickname, password } = req.body;
  // TODO: Validate credentials and generate JWT
  const token = jwt.sign({ nickname }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.send({ token });
});

authServer.listen(authPort, () => {
  console.log(`Auth Server running on port ${authPort}`);
});

// **3. Game Server Setup**
const gameServer = express();
gameServer.engine("handlebars", Handlebars());
gameServer.set("view engine", "handlebars");

gameServer.use(express.json());

// Game features
gameServer.get("/players", (req, res) => {
  // TODO: Return online players
  res.send([]);
});

gameServer.get("/game-rooms", (req, res) => {
  // TODO: Return available game rooms
  res.send([]);
});

gameServer.post("/create-room", (req, res) => {
  const { roomType } = req.body;
  // TODO: Create a new game room
  res.send({ message: `Room of type ${roomType} created` });
});

// Tic-tac-toe implementation placeholder
gameServer.post("/start-game", (req, res) => {
  const { roomId } = req.body;
  // TODO: Start game logic
  res.send({ message: `Game started in room ${roomId}` });
});

// Profile management
gameServer.get("/profile/:nickname", (req, res) => {
  const { nickname } = req.params;
  // TODO: Fetch profile data
  res.send({ nickname, avatar: "", gameHistory: [] });
});

// Replay or view game history
gameServer.get("/replay/:gameId", (req, res) => {
  const { gameId } = req.params;
  // TODO: Replay logic
  res.send({ gameId, moves: [] });
});

gameServer.listen(gamePort, () => {
  console.log(`Game Server running on port ${gamePort}`);
});

// **4. Concurrently Setup**
// Configure package.json "scripts" section for concurrent startup:
// "scripts": {
//   "start": "concurrently \"nodemon gameServer.js\" \"nodemon authServer.js\""
// }
