const { Pool } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

async function testConnection() {
  console.log('Database Connection Test');
  console.log('======================\n');

  // Check if .env file exists
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found. Please create one based on .env.example');
    return false;
  }

  // Log connection parameters (without password)
  console.log('Connection parameters:');
  console.log(`- User: ${process.env.DB_USER}`);
  console.log(`- Host: ${process.env.DB_HOST}`);
  console.log(`- Database: ${process.env.DB_NAME}`);
  console.log(`- Port: ${process.env.DB_PORT || '5432'}`);
  console.log('- Password: [HIDDEN]\n');

  try {
    // Create a connection pool
    const pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 5432,
      // Set a short connection timeout
      connectionTimeoutMillis: 5000,
    });

    console.log('Attempting to connect to database...');

    // Test the connection
    const client = await pool.connect();
    console.log('✅ Database connection successful!\n');

    // Check which tables exist
    const tableQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    try {
      const result = await client.query(tableQuery);
      
      if (result.rows.length === 0) {
        console.log('No tables found in the database.');
        console.log('Run "npm run setup" to create the necessary tables.\n');
      } else {
        console.log('Tables in the database:');
        result.rows.forEach(row => {
          console.log(`- ${row.table_name}`);
        });
      }
    } catch (queryError) {
      console.error('❌ Error querying tables:', queryError.message);
    }

    client.release();
    console.log('Connection released.');
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    if (error.message.includes('password authentication failed')) {
      console.log('\nPossible solutions:');
      console.log('1. Check that your DB_PASSWORD in .env is correct');
      console.log('2. If you forgot your PostgreSQL password, see db-troubleshooting.md');
      console.log('3. Try creating a new database user specifically for this application');
    }
  } finally {
    await pool.end();
    console.log('Test completed.');
  }
}

testConnection();
