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

module.exports = {
  pool,
};

