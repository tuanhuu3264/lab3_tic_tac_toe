const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
var expressHbs = require("express-handlebars");
const { engine } = require("express-handlebars");
require("./configs/passport")(passport);
const path = require("path");
var logger = require("morgan");
const auth_controller = require("./controllers/auth_controller");
var cookieParser = require("cookie-parser");
var expressSession = require("express-session");
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
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());

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
const authenticateJWT = passport.authenticate("jwt", { session: false });

app.get("/login", (req, res) => {
  res.render("tie_tac_toe/login");
});
app.post("/login", async (req, res) => await auth_controller.login(req, res));
app.get("/rooms", authenticateJWT, (req, res) => {
  res.render("tie_tac_toe/waiting_room");
});
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
