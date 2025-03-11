const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🛠️ Creating and configuring server.js in root directory');

// Check if server.js exists in root
const rootServerPath = './server.js';
const backendServerPath = './backend/server.js';
let serverExists = fs.existsSync(rootServerPath);
let backendServerExists = fs.existsSync(backendServerPath);

console.log(`Root server.js exists: ${serverExists}`);
console.log(`Backend server.js exists: ${backendServerExists}`);

// Create backup of existing server if it exists
if (serverExists) {
  const backupPath = `${rootServerPath}.backup-${Date.now()}`;
  fs.copyFileSync(rootServerPath, backupPath);
  console.log(`✅ Created backup of existing server.js at ${backupPath}`);
}

// Create a proper server.js file in the root directory
console.log('Creating new server.js file in root directory...');

const serverCode = `// Basic Express server to serve static files and handle API routes
const express = require('express');
const path = require('path');
const fs = require('fs');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the newfrontend folder
app.use(express.static('./newfrontend'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Gold-rupee data endpoint
app.get('/api/gold-rupee', (req, res) => {
  console.log('Gold-rupee endpoint called');
  
  try {
    // Find and read the data file
    const dataFiles = [
      path.join(__dirname, 'newfrontend/data/gold_rupee_data.json'),
      path.join(__dirname, 'newfrontend/data/gold-rupee-data.json'),
      path.join(__dirname, 'backend/data/gold_rupee_data.json'),
      path.join(__dirname, 'data/gold_rupee_data.json')
    ];
    
    let dataFile = null;
    for (const file of dataFiles) {
      if (fs.existsSync(file)) {
        dataFile = file;
        console.log(\`Using data file: \${dataFile}\`);
        break;
      }
    }
    
    if (!dataFile) {
      return res.status(404).json({ error: 'Data file not found' });
    }
    
    const jsonData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    
    // Filter for 5-year range
    const now = new Date();
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(now.getFullYear() - 5);
    
    // Process based on data format
    let processedData = jsonData;
    
    if (Array.isArray(jsonData)) {
      // Direct array format
      processedData = jsonData.filter(item => new Date(item.date) >= fiveYearsAgo);
      console.log(\`Filtered array data to \${processedData.length} records\`);
    } else if (jsonData.data && Array.isArray(jsonData.data)) {
      // Object with data array
      processedData.data = jsonData.data.filter(item => new Date(item.date) >= fiveYearsAgo);
      console.log(\`Filtered data.data to \${processedData.data.length} records\`);
    } else if (jsonData.goldData && Array.isArray(jsonData.goldData)) {
      // Object with separate arrays
      processedData.goldData = jsonData.goldData.filter(item => new Date(item.date) >= fiveYearsAgo);
      
      if (jsonData.rupeeData && Array.isArray(jsonData.rupeeData)) {
        processedData.rupeeData = jsonData.rupeeData.filter(item => new Date(item.date) >= fiveYearsAgo);
      }
      
      console.log(\`Filtered goldData to \${processedData.goldData.length} records\`);
    }
    
    return res.json(processedData);
  } catch (error) {
    console.error('Error in gold-rupee endpoint:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Handle economic data requests
app.get('/api/econ-data', (req, res) => {
  try {
    const econDataFiles = [
      path.join(__dirname, 'newfrontend/data/econ_data.json'),
      path.join(__dirname, 'backend/data/econ_data.json')
    ];
    
    let dataFile = econDataFiles.find(file => fs.existsSync(file));
    if (!dataFile) {
      return res.status(404).json({ error: 'Economic data file not found' });
    }
    
    const econData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    res.json(econData);
  } catch (error) {
    console.error('Error serving economic data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Handle financial data requests
app.get('/api/financial', (req, res) => {
  try {
    const financialDataFiles = [
      path.join(__dirname, 'newfrontend/data/financial_data.json'),
      path.join(__dirname, 'backend/data/financial_data.json')
    ];
    
    let dataFile = financialDataFiles.find(file => fs.existsSync(file));
    if (!dataFile) {
      return res.status(404).json({ error: 'Financial data file not found' });
    }
    
    const financialData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    res.json(financialData);
  } catch (error) {
    console.error('Error serving financial data:', error);
    res.status(500).json({ error: error.message });
  }
});

// All other GET requests not handled before will return the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './newfrontend/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
  console.log(\`Serving static files from: \${path.join(__dirname, 'newfrontend')}\`);
  console.log('API endpoints available at: /api/health, /api/gold-rupee, /api/econ-data, /api/financial');
});
`;

// Write the server file
fs.writeFileSync(rootServerPath, serverCode);
console.log('✅ Created server.js in root directory');

// Ensure express is installed
console.log('\nChecking if Express is installed...');
try {
  require.resolve('express');
  console.log('✅ Express is already installed');
} catch (e) {
  console.log('Express not found, installing...');
  try {
    execSync('npm install express', { stdio: 'inherit' });
    console.log('✅ Express installed successfully');
  } catch (err) {
    console.error('❌ Error installing Express:', err.message);
    console.log('Please run: npm install express');
  }
}

// Create a data directory to store data files if needed
if (!fs.existsSync('./data')) {
  fs.mkdirSync('./data', { recursive: true });
  console.log('✅ Created data directory');
}

// Check if gold-rupee data exists and create it if not
const dataFiles = [
  './newfrontend/data/gold_rupee_data.json',
  './newfrontend/data/gold-rupee-data.json',
  './backend/data/gold_rupee_data.json',
  './data/gold_rupee_data.json'
];

let dataFileExists = false;
for (const file of dataFiles) {
  if (fs.existsSync(file)) {
    dataFileExists = true;
    console.log(`✅ Found gold-rupee data at ${file}`);
    break;
  }
}

if (!dataFileExists) {
  console.log('Creating sample gold-rupee data...');
  
  // Create directory if needed
  const dataDir = './data';
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Generate sample data
  const sampleData = {
    data: generateSampleGoldRupeeData()
  };
  
  fs.writeFileSync('./data/gold_rupee_data.json', JSON.stringify(sampleData, null, 2));
  console.log('✅ Created sample gold-rupee data at ./data/gold_rupee_data.json');
}

console.log('\n✅ Server setup complete!');
console.log('You can now start the server with:');
console.log('  node server.js');

// Helper function to generate sample gold-rupee data for the last 6 years
function generateSampleGoldRupeeData() {
  const data = [];
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 6); // 6 years ago
  
  // Generate one data point per month
  for (let i = 0; i < 72; i++) { // 72 months = 6 years
    const currentDate = new Date(startDate);
    currentDate.setMonth(startDate.getMonth() + i);
    
    // Base values with some random variation
    const baseGoldPrice = 1500 + (i * 10); // Gradually increasing trend
    const baseRupeeRate = 70 + (i * 0.05); // Gradually increasing trend
    
    // Add some random variation
    const goldRandomness = (Math.random() - 0.5) * 100;
    const rupeeRandomness = (Math.random() - 0.5) * 2;
    
    // Final values
    const goldPrice = Math.max(1200, Math.min(2200, baseGoldPrice + goldRandomness));
    const rupeeRate = Math.max(65, Math.min(85, baseRupeeRate + rupeeRandomness));
    
    data.push({
      date: currentDate.toISOString().split('T')[0],
      goldPrice: goldPrice.toFixed(2),
      rupeeRate: rupeeRate.toFixed(2)
    });
  }
  
  return data;
}
