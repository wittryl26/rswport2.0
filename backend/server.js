const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Serve static files from newfrontend directory
app.use(express.static('./newfrontend'));

const port = process.env.PORT || 3001;

// Enable CORS for development - in production, you might want to restrict this
app.use(cors());

// Serve static files from the newfrontend directory
app.use(express.static(path.join(__dirname, 'newfrontend')));

// Sample API endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Add your other API routes here
// app.get('/api/gold-inr-data', ...);
// app.get('/api/financial-data', ...);

// For SPA routing - serve index.html for any unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'newfrontend', 'index.html'));
});
// Gold price and USD/INR exchange rate data
app.get('/gold-rupee', (req, res) => {
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
    } else if (jsonData.data && Array.isArray(jsonData.data)) {
      // Object with data array
      processedData.data = jsonData.data.filter(item => new Date(item.date) >= fiveYearsAgo);
    } else if (jsonData.goldData && Array.isArray(jsonData.goldData)) {
      // Object with separate arrays
      processedData.goldData = jsonData.goldData.filter(item => new Date(item.date) >= fiveYearsAgo);
      
      if (jsonData.rupeeData && Array.isArray(jsonData.rupeeData)) {
        processedData.rupeeData = jsonData.rupeeData.filter(item => new Date(item.date) >= fiveYearsAgo);
      }
    }
    
    return res.json(processedData);
  } catch (error) {
    console.error('Error in gold-rupee endpoint:', error);
    return res.status(500).json({ error: error.message });
  }
});



// Start the server


// Handle SPA - serve index.html for any unmatched route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './newfrontend/index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`newfrontend available at http://localhost:${port}`);
  console.log(`API available at http://localhost:${port}/api`);
});
