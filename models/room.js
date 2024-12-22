const { pool } = require("../dbProvider");

class Room {
  constructor(username, fullname, password) {
    this.username = username;
    this.fullname = fullname;
    this.password = password;
  }

  static async login(username, password) {
    const query = {
      text: "SELECT * FROM users WHERE username = $1 AND password = $2",
      values: [username, password],
    };
    pool.connect((err, client, release) => {
      if (err) {
        return console.error("Error acquiring client", err.stack);
      }
      client.query(query, (err, result) => {
        release();
        if (err) {
          return console.error("Error executing query", err.stack);
        }
        return result;
      });
    });
  }
}

module.exports = User;
