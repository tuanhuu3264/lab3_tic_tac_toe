const { pool } = require("../dbProvider");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "your_secret_key";
class User {
  constructor(username, fullname, password) {
    this.username = username;
    this.fullname = fullname;
    this.password = password;
  }

  static async login(username, password) {
    const query = {
      text: 'SELECT * FROM "User" WHERE "username" = $1 AND "password" = $2',
      values: [username, password],
    };

    try {
      const { rows } = await pool.query(query);

      if (rows.length === 0) {
        return null;
      }
      const user = rows[0];
      const payload = {
        userId: user.id,
        username: user.username,
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

      console.log("Generated token:", token);

      return { user, token };
    } catch (err) {
      console.error("Error executing query", err.stack);
      throw new Error("Login failed");
    }
  }
}

module.exports = User;
