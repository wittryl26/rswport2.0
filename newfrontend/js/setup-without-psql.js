const { Pool } = require('pg');
const readline = require('readline');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('PostgreSQL Setup Without psql');
console.log('----------------------------');
console.log('This script will help set up your database without needing psql.\n');

// Load or prompt for configuration
const dbConfig = {
  user: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  password: '',
  port: process.env.DB_PORT || 5432,
  database: 'postgres' // Connect to default database first
};

const appDbName = process.env.DB_NAME || 'econ_strategy_dw';
const appDbUser = process.env.DB_USER || 'myuser';
const appDbPassword = process.env.DB_PASSWORD || 'mypassword';

async function setupDatabase() {
  // Get postgres password
  rl.question('Enter PostgreSQL admin (postgres) password: ', async (password) => {
    dbConfig.password = password;
    
    try {
      // Connect to PostgreSQL
      console.log('Connecting to PostgreSQL...');
      const adminPool = new Pool(dbConfig);
      
      // Test connection
      await adminPool.query('SELECT 1');
      console.log('✅ Connected successfully to PostgreSQL');
      
      // Check if database exists
      console.log(`Checking if database "${appDbName}" exists...`);
      const dbCheckResult = await adminPool.query(
        'SELECT 1 FROM pg_database WHERE datname = $1', [appDbName]
      );
      
      if (dbCheckResult.rows.length === 0) {
        console.log(`Creating database "${appDbName}"...`);
        await adminPool.query(`CREATE DATABASE ${appDbName}`);
        console.log(`✅ Database "${appDbName}" created`);
      } else {
        console.log(`Database "${appDbName}" already exists`);
      }
      
      // Check if user exists
      console.log(`Checking if user "${appDbUser}" exists...`);
      const userCheckResult = await adminPool.query(
        'SELECT 1 FROM pg_roles WHERE rolname = $1', [appDbUser]
      );
      
      if (userCheckResult.rows.length === 0) {
        console.log(`Creating user "${appDbUser}"...`);
        await adminPool.query('CREATE USER $1 WITH PASSWORD $2', [appDbUser, appDbPassword]);
        console.log(`✅ User "${appDbUser}" created`);
      } else {
        console.log(`Updating password for user "${appDbUser}"...`);
        await adminPool.query('ALTER USER $1 WITH PASSWORD $2', [appDbUser, appDbPassword]);
        console.log(`✅ User "${appDbUser}" password updated`);
      }
      
      // Grant privileges
      console.log('Granting privileges...');
      await adminPool.query(`GRANT ALL PRIVILEGES ON DATABASE ${appDbName} TO ${appDbUser}`);
      console.log(`✅ Granted privileges on database "${appDbName}" to "${appDbUser}"`);
      
      console.log('\n✅ Setup complete! Your database is ready to use.');
      console.log('You can now run "node db-connection-test.js" to verify the connection.');
      
      adminPool.end();
      rl.close();
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      console.log('\nTroubleshooting:');
      console.log('1. Check that PostgreSQL service is running');
      console.log('2. Verify you entered the correct postgres admin password');
      console.log('3. If PostgreSQL is installed in a non-standard location, verify host and port in .env');
      rl.close();
    }
  });
}

setupDatabase();
