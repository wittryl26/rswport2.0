const { Pool } = require('pg');
const dotenv = require('dotenv');
const readline = require('readline');

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('PostgreSQL User Creation Utility');
console.log('--------------------------------');

// First connect as postgres (admin) user
async function createUser() {
  console.log('This script will create the "myuser" user and grant permissions to your database.');
  
  rl.question('Enter PostgreSQL admin password (for user "postgres"): ', async (adminPassword) => {
    try {
      // Connect as postgres admin
      const adminPool = new Pool({
        user: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: 'postgres',
        password: adminPassword,
        port: process.env.DB_PORT || 5432,
      });

      console.log('Connecting as postgres admin user...');
      
      // Check if database exists, create if not
      const dbName = process.env.DB_NAME || 'econ_strategy_dw';
      const dbCheckResult = await adminPool.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]
      );
      
      if (dbCheckResult.rows.length === 0) {
        console.log(`Database "${dbName}" doesn't exist. Creating it...`);
        await adminPool.query(`CREATE DATABASE ${dbName}`);
        console.log(`Database "${dbName}" created successfully.`);
      }
      
      // Check if user exists
      const userCheckResult = await adminPool.query(
        `SELECT 1 FROM pg_roles WHERE rolname = $1`, ['myuser']
      );
      
      if (userCheckResult.rows.length === 0) {
        // Create new user with password from .env
        const userPassword = process.env.DB_PASSWORD || 'mypassword';
        await adminPool.query(`CREATE USER myuser WITH PASSWORD $1`, [userPassword]);
        console.log('"myuser" created successfully.');
      } else {
        // Update password for existing user
        const userPassword = process.env.DB_PASSWORD || 'mypassword';
        await adminPool.query(`ALTER USER myuser WITH PASSWORD $1`, [userPassword]);
        console.log('Updated password for existing "myuser".');
      }
      
      // Grant privileges
      await adminPool.query(`GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO myuser`);
      console.log(`Granted privileges on database "${dbName}" to "myuser"`);
      
      console.log('\n✅ Setup complete! Your database user is ready to use.');
      console.log('You can now run "node db-connection-test.js" to verify the connection.');
      
      adminPool.end();
      rl.close();
    } catch (error) {
      console.error('❌ Error:', error.message);
      console.log('\nTroubleshooting:');
      console.log('1. Verify you entered the correct postgres admin password');
      console.log('2. Make sure PostgreSQL service is running');
      console.log('3. If you don\'t know the postgres password, see db-troubleshooting.md');
      rl.close();
    }
  });
}

createUser();
