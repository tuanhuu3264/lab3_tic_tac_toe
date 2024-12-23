const { pool } = require("../dbProvider");
const User = require("../models/user");

class Room {
  constructor(username, fullname, password) {
    this.username = username;
    this.fullname = fullname;
    this.password = password;
  }
  static async findByOwnerId(ownId) {
    const query = {
      text: 'SELECT * FROM "Room" WHERE "owner_id" = $1',
      values: [ownId],
    };
    try {
      const { rows } = await pool.query(query);

      if (rows.length === 0) {
        return null;
      }
      return rows[0];
    } catch (err) {
      console.error("Error executing query", err.stack);
      throw new Error("Login failed");
    }
  }
  
  static async getAllRooms() {
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
      throw new Error("Find failed");
    }
  }

  static async insertRoom(ownId, type, size) {
    try {
      const { rows } = await pool.query(
        'INSERT INTO "Room" (owner_id, type, size) VALUES ($1, $2, $3) RETURNING *',
        [ownId, type, size]
      );
      if (rows.length === 0) {
        return null;
      }
      return rows[0];
    } catch (err) {
      console.error("Error executing query", err.stack);
      throw new Error("Insert Room failed");
    }
  }
}

module.exports = Room;
