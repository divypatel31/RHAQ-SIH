const { Pool } = require("pg");
require("dotenv").config();

// Prefer a single DATABASE_URL (works with most hosting providers);
// fall back to individual PG* vars for local dev.
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      host: process.env.PGHOST,
      port: process.env.PGPORT,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
    });

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL error on idle client:", err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
