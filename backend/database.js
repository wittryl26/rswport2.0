const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Create connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// Connect to the database
const connectToDatabase = async () => {
  try {
    await pool.connect();
    console.log('Connected to PostgreSQL database');
  } catch (error) {
    console.error('Database connection error:', error.message);
    // Give some time before retrying
    setTimeout(connectToDatabase, 5000);
  }
};

// Query helper function
const query = (text, params) => pool.query(text, params);

module.exports = {
  query,
  connectToDatabase,
  pool,
};
