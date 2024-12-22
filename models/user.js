const { pool } = require("../dbProvider");
const jwt = require("jsonwebtoken");
const JWT_SECRET =
  "16f20737f84f2a1691f22a732b0a2e52342ea1e313432fe7d673df8b438fae7403d28fe5beefc5c7b87794730ef917a613b40fbbd7d05a4f3f2f10d650e531acc453f1138b59ea564c5c03e4ae906e01172e427781ff82baf3454bef1eec21971a7f75eb055619637850cb24f4e5d170db6f2e6fca8d0505905c4445951f4e17eb2c2ee9e1fd90d6a98bd13a3653aecec3251435a646473e8bb002254ac6d781ec249efb646d9266f4a1e4576786067f286acf88c354ab2226a87f0136833ff922323f3ff8e87d2c71ea6ec7f795c814cf8d5ae36dc4328bf35243282d9032db9135ced698e39a219cbc606ab1707ca34722ed18efe7c207bb091e3081d6a197";
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
  static async findById(id) {
    const query = {
      text: 'SELECT * FROM "User" WHERE "id" = $1',
      values: [id],
    };

    try {
      const { rows } = await pool.query(query);

      if (rows.length === 0) {
        return null;
      }
      const user = rows[0];
      return user;
    } catch (err) {
      console.error("Error executing query", err.stack);
      throw new Error("Login failed");
    }
  }
  static async updateField(id, fieldName, newValue) {
    try {
      const query = `
      UPDATE "User"
      SET "${fieldName}" = $1
      WHERE "id" = $2
      RETURNING *;
    `;
      const result = await pool.query(query, [newValue, id]);

      if (result.rowCount > 0) {
        console.log("Successfully update", result.rows[0]);
        return result.rows[0];
      } else {
        console.log("Not found id:", id);
        return null;
      }
    } catch (error) {
      console.error("Error executing query:", error.message);
      throw error;
    }
  }
  static async getAllActivedUsersExceptId(id) {
    const query = {
      text: 'SELECT * FROM "User" WHERE "id" <> $1',
      values: [id],
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
  static async getRankedUsers() {
    const query = {
      text: 'SELECT * FROM "User" ORDER BY "score" DESC LIMIT $1 OFFSET $2',
      values: [10, 0],
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
  static async register(username, fullname, password) {
    try {
      const { rows } = await pool.query(
        'INSERT INTO "User" (username, fullname, password) VALUES ($1, $2, $3) RETURNING *',
        [username, fullname, password]
      );
      if (rows.length === 0) {
        return null;
      }
      return rows[0];
    } catch (err) {
      console.error("Error executing query", err.stack);
      throw new Error("Login failed");
    }
  }
}

module.exports = User;
