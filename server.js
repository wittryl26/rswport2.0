const express = require('express');
const path = require('path');
const fs = require('fs');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Add CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Request logging middleware - Add this BEFORE routes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Error logging middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// Middleware for parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API ROUTES MUST COME BEFORE STATIC FILES

// Test endpoint to verify API is working
app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'API is working' });
});

// Gold-rupee data endpoint
app.get('/api/gold-rupee', (req, res) => {
  try {
    // Log that we hit this endpoint
    console.log('Gold-rupee endpoint called');

    // Check data files
    const dataFiles = [
      path.join(__dirname, 'data/gold_rupee_data.json'),
      path.join(__dirname, 'newfrontend/data/gold_rupee_data.json'),
      path.join(__dirname, 'backend/data/gold_rupee_data.json')
    ];

    console.log('Checking data files:', dataFiles);
    
    const dataFile = dataFiles.find(file => fs.existsSync(file));
    
    if (!dataFile) {
      console.log('No data file found, creating sample data');
      // Create sample data
      const sampleData = {
        data: Array.from({ length: 60 }).map((_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - (59 - i));
          return {
            date: date.toISOString().split('T')[0],
            goldPrice: 1500 + Math.random() * 500,
            rupeeRate: 70 + Math.random() * 10
          };
        })
      };
      
      // Ensure data directory exists
      if (!fs.existsSync('./data')) {
        fs.mkdirSync('./data', { recursive: true });
      }
      
      // Write sample data
      fs.writeFileSync('./data/gold_rupee_data.json', JSON.stringify(sampleData, null, 2));
      console.log('Created sample data at ./data/gold_rupee_data.json');
      
      // Set explicit JSON header
      res.setHeader('Content-Type', 'application/json');
      return res.json(sampleData);
    }
    
    // Read and parse the data file
    console.log(`Reading data from ${dataFile}`);
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    
    // Filter for 5-year range if needed
    const now = new Date();
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(now.getFullYear() - 5);
    
    let processedData = data;
    if (data.data && Array.isArray(data.data)) {
      processedData = {
        ...data,
        data: data.data.filter(item => new Date(item.date) >= fiveYearsAgo)
      };
    }
    
    // Set explicit JSON header and return data
    res.setHeader('Content-Type', 'application/json');
    return res.json(processedData);
    
  } catch (error) {
    console.error('Error in gold-rupee endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fix econ-data endpoint
app.get('/econ-data', (req, res) => {
  try {
    const econDataFiles = [
      path.join(__dirname, 'newfrontend/data/econ_data.json'),
      path.join(__dirname, 'data/econ_data.json')
    ];
    
    let dataFile = econDataFiles.find(file => fs.existsSync(file));
    if (!dataFile) {
      return res.json({
        status: 'error',
        message: 'Economic data file not found',
        data: []
      });
    }
    
    const econData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    res.json(econData);
  } catch (error) {
    console.error('Error serving economic data:', error);
    res.json({
      status: 'error',
      message: error.message,
      data: []
    });
  }
});

// Static files come AFTER API routes
app.use(express.static('./newfrontend'));

// Catch-all route comes LAST
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './newfrontend/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Test the API at: http://localhost:3001/api/test');
  console.log('Gold-rupee data at: http://localhost:3001/api/gold-rupee');
});
