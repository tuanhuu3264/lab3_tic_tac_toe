const { pool } = require("../dbProvider");

class Room {
  constructor(username, fullname, password) {
    this.username = username;
    this.fullname = fullname;
    this.password = password;
  }

  static async getAllRooms(username, password) {
    const query = {
      text: 'SELECT * FROM "Room"',
    };
    try {
      const { rows } = await pool.query(query);

      if (rows.length === 0) {
        return null;
      }
      return rows;
    } catch (err) {
      console.error("Error executing query", err.stack);
      throw new Error("Login failed");
    }
  }
}

module.exports = User;
