const { Pool } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Handle missing yaml module gracefully
let yaml;
try {
  yaml = require('js-yaml');
} catch (e) {
  console.error('\n❌ Error: js-yaml module not found.');
  console.log('Please run: npm install js-yaml');
  console.log('Or run: node install-dependencies.js');
  process.exit(1);
}

dotenv.config();

// Create connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function setupDatabase() {
  try {
    console.log('Setting up sample data for portfolio API...');
    console.log('Using credentials from .env file...');
    
    // Test connection first
    try {
      const testClient = await pool.connect();
      console.log('✅ Successfully connected to database with your credentials');
      testClient.release();
    } catch (error) {
      console.error('❌ Connection failed:', error.message);
      console.log('\nPlease check:');
      console.log('1. Your database credentials in .env file are correct');
      console.log('2. The database exists and is accessible by your user');
      console.log('3. Your PostgreSQL server is running');
      console.log('\nSee non-admin-setup.md for more help.');
      process.exit(1);
    }
    
    // Create tables if they don't exist
    await createTables();
    
    // Load sample data
    await loadEconomicData();
    await loadTrelloData();
    await loadFinancialData();
    
    console.log('✅ Sample data setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    console.log('\nIf you received a "permission denied" error, your user may not have sufficient privileges.');
    console.log('Please check non-admin-setup.md for guidance on how to proceed.');
    process.exit(1);
  }
}

// Modified to handle permission errors gracefully
async function createTables() {
  const client = await pool.connect();
  try {
    console.log('Creating tables if they do not exist...');
    
    // Try to create the tables one by one to handle permission issues
    try {
      // Economic data table
      await client.query(`
        CREATE TABLE IF NOT EXISTS economic_data (
          id SERIAL PRIMARY KEY,
          date DATE NOT NULL,
          indicator TEXT NOT NULL,
          value NUMERIC NOT NULL,
          source TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Economic data table ready');
    } catch (error) {
      console.error('❌ Could not create economic_data table:', error.message);
    }
    
    try {
      // Trello data table
      await client.query(`
        CREATE TABLE IF NOT EXISTS trello_data (
          id SERIAL PRIMARY KEY,
          card_id TEXT NOT NULL,
          title TEXT NOT NULL,
          status TEXT NOT NULL,
          list_name TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Trello data table ready');
    } catch (error) {
      console.error('❌ Could not create trello_data table:', error.message);
    }
    
    try {
      // Financial data table
      await client.query(`
        CREATE TABLE IF NOT EXISTS financial_data (
          id SERIAL PRIMARY KEY,
          date DATE NOT NULL,
          actual NUMERIC NOT NULL,
          predicted NUMERIC NOT NULL,
          indicator TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Financial data table ready');
    } catch (error) {
      console.error('❌ Could not create financial_data table:', error.message);
    }
    
    console.log('Table setup completed (some tables may have been skipped due to permissions)');
  } finally {
    client.release();
  }
}

async function loadEconomicData() {
  const client = await pool.connect();
  try {
    console.log('Loading sample economic data...');
    
    // Clear existing data
    await client.query('DELETE FROM economic_data');
    
    // Generate sample data - 100 records of economic data
    const startDate = new Date('2022-01-01');
    const sampleData = [];
    
    for (let i = 0; i < 100; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      sampleData.push({
        date: date.toISOString().split('T')[0],
        indicator: 'GDP Growth',
        value: (Math.random() * 5 - 1).toFixed(2), // Random value between -1 and 4
        source: 'Federal Reserve'
      });
    }
    
    // Insert sample data
    for (const item of sampleData) {
      await client.query(
        'INSERT INTO economic_data (date, indicator, value, source) VALUES ($1, $2, $3, $4)',
        [item.date, item.indicator, item.value, item.source]
      );
    }
    
    console.log(`✅ Added ${sampleData.length} economic data records`);
  } finally {
    client.release();
  }
}

async function loadTrelloData() {
  const client = await pool.connect();
  try {
    console.log('Loading sample Trello data...');
    
    // Clear existing data
    await client.query('DELETE FROM trello_data');
    
    // Sample Trello data
    const statuses = ['To Do', 'In Progress', 'In Review', 'Done'];
    const sampleData = [];
    
    for (let i = 1; i <= 20; i++) {
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      sampleData.push({
        card_id: `card-${i}`,
        title: `Task ${i}: Implement feature`,
        status: randomStatus,
        list_name: randomStatus,
      });
    }
    
    // Insert sample data
    for (const item of sampleData) {
      await client.query(
        'INSERT INTO trello_data (card_id, title, status, list_name) VALUES ($1, $2, $3, $4)',
        [item.card_id, item.title, item.status, item.list_name]
      );
    }
    
    console.log(`✅ Added ${sampleData.length} Trello data records`);
  } finally {
    client.release();
  }
}

async function loadFinancialData() {
  const client = await pool.connect();
  try {
    console.log('Loading sample financial data...');
    
    // Clear existing data
    await client.query('DELETE FROM financial_data');
    
    // Generate sample data - 50 records of financial data
    const startDate = new Date('2022-01-01');
    const sampleData = [];
    
    let actual = 100; // Starting value
    
    for (let i = 0; i < 50; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      // Create some variance in the actual values
      const change = (Math.random() * 10) - 5; // Random change between -5 and 5
      actual += change;
      
      // Predicted is actual with some error
      const predicted = actual + (Math.random() * 8) - 4; // Prediction within ±4 of actual
      
      sampleData.push({
        date: date.toISOString().split('T')[0],
        actual: actual.toFixed(2),
        predicted: predicted.toFixed(2),
        indicator: 'Market Index'
      });
    }
    
    // Insert sample data
    for (const item of sampleData) {
      await client.query(
        'INSERT INTO financial_data (date, actual, predicted, indicator) VALUES ($1, $2, $3, $4)',
        [item.date, item.actual, item.predicted, item.indicator]
      );
    }
    
    console.log(`✅ Added ${sampleData.length} financial data records`);
  } finally {
    client.release();
  }
}

// Load external API endpoints from YAML file
async function loadApiEndpoints() {
  try {
    console.log('Reading API endpoints from configuration file...');
    
    const apiConfigPath = path.join(__dirname, '../data/api_endpoint.yml');
    
    if (fs.existsSync(apiConfigPath)) {
      const fileContents = fs.readFileSync(apiConfigPath, 'utf8');
      try {
        const apiConfig = yaml.load(fileContents);
        
        console.log('Available API categories:');
        Object.keys(apiConfig).forEach(category => {
          console.log(`- ${category} (${Object.keys(apiConfig[category]).length} endpoints)`);
        });
        
        return apiConfig;
      } catch (yamlError) {
        console.error('❌ Error parsing YAML file:', yamlError.message);
        return {};
      }
    } else {
      console.log('⚠️ API endpoints configuration file not found.');
      console.log(`Expected location: ${apiConfigPath}`);
      console.log('This is optional, continuing with setup...');
      return {};
    }
  } catch (error) {
    console.error('Error loading API endpoints:', error);
    return {};
  }
}

// Run the setup
setupDatabase();
// Also export the loadApiEndpoints function for use elsewhere
module.exports = { loadApiEndpoints };
