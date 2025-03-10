const { Pool } = require('pg');
require('dotenv').config();

console.log('Database Connection Test');
console.log('------------------------');
console.log('Testing connection with these parameters:');
console.log(`Host: ${process.env.DB_HOST}`);
console.log(`Port: ${process.env.DB_PORT || 5432}`);
console.log(`Database: ${process.env.DB_NAME}`);
console.log(`User: ${process.env.DB_USER}`);
console.log(`Password: ${process.env.DB_PASSWORD ? '********' : 'Not set'}`);
console.log('');

// Create a pool with a short timeout
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  connectionTimeoutMillis: 5000, // 5 seconds
});

async function testConnection() {
  let client;
  try {
    console.log('Attempting to connect to PostgreSQL...');
    client = await pool.connect();
    console.log('✅ Connected successfully!');
    
    // Test a simple query
    console.log('Running test query...');
    const result = await client.query('SELECT NOW()');
    console.log(`✅ Query successful! Database time: ${result.rows[0].now}`);
    
    console.log('\nDatabase connection is working properly.');
    
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error(error.message);
    
    console.log('\nTROUBLESHOOTING TIPS:');
    console.log('---------------------');
    
    if (error.message.includes('password authentication')) {
      console.log('1. The password in your .env file is incorrect.');
      console.log('   Update DB_PASSWORD in your .env file with the correct PostgreSQL password.');
    }
    
    if (error.message.includes('does not exist')) {
      console.log('1. Database does not exist. You need to create it first.');
      console.log(`2. Run: CREATE DATABASE ${process.env.DB_NAME || 'portfolio'}`);
    }
    
    if (error.message.includes('connect ECONNREFUSED')) {
      console.log('1. PostgreSQL server is not running.');
      console.log('2. Check if PostgreSQL service is active on your system.');
      console.log('3. Verify the DB_HOST and DB_PORT values in your .env file.');
    }
  } finally {
    if (client) {
      client.release();
    }
    
    // Close the pool
    await pool.end();
  }
}

testConnection();
