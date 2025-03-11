const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🔄 Fixing API endpoint issue - HTML instead of JSON response');

// Make sure server.js is correct
const serverPath = './server.js';
if (!fs.existsSync(serverPath)) {
  console.error('❌ server.js file not found!');
  process.exit(1);
}

// Create a backup of server.js
const backupPath = `${serverPath}.backup-${Date.now()}`;
fs.copyFileSync(serverPath, backupPath);
console.log(`✅ Created backup of server.js at ${backupPath}`);

// Completely rebuild the server.js with a clean implementation that guarantees API routes come before the catch-all route
console.log('\n1️⃣ Creating a clean server.js file with properly ordered routes...');

const cleanServerJs = `// Express server with properly ordered routes
const express = require('express');
const path = require('path');
const fs = require('fs');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(\`[REQUEST] \${req.method} \${req.url}\`);
  next();
});

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =============================================================================
// API ROUTES - These must come BEFORE the static files and catch-all handlers
// =============================================================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Gold-rupee data endpoint - IMPORTANT: Must be processed before the catch-all route
app.get('/api/gold-rupee', (req, res) => {
  console.log('Gold-rupee API endpoint called');
  
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
      processedData = { 
        ...jsonData,
        data: jsonData.data.filter(item => new Date(item.date) >= fiveYearsAgo) 
      };
      console.log(\`Filtered data.data to \${processedData.data.length} records\`);
    } else if (jsonData.goldData && Array.isArray(jsonData.goldData)) {
      // Object with separate arrays
      processedData = { 
        ...jsonData,
        goldData: jsonData.goldData.filter(item => new Date(item.date) >= fiveYearsAgo)
      };
      
      if (jsonData.rupeeData && Array.isArray(jsonData.rupeeData)) {
        processedData.rupeeData = jsonData.rupeeData.filter(item => new Date(item.date) >= fiveYearsAgo);
      }
      
      console.log(\`Filtered goldData to \${processedData.goldData.length} records\`);
    }
    
    // Set explicit headers to ensure client treats this as JSON
    res.setHeader('Content-Type', 'application/json');
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
    
    // Set explicit headers to ensure client treats this as JSON
    res.setHeader('Content-Type', 'application/json');
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
    
    // Set explicit headers to ensure client treats this as JSON
    res.setHeader('Content-Type', 'application/json');
    res.json(financialData);
  } catch (error) {
    console.error('Error serving financial data:', error);
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// STATIC FILES - Serve after API routes but before the catch-all
// =============================================================================

// Serve static files from the newfrontend folder
app.use(express.static('./newfrontend'));

// =============================================================================
// CATCH-ALL ROUTE - Must be registered LAST
// =============================================================================

// All other GET requests not handled before will return the React app
app.get('*', (req, res) => {
  // This should only handle non-API routes
  if (req.url.startsWith('/api/')) {
    console.warn(\`WARNING: Catch-all route is handling API request: \${req.url}\`);
  }
  res.sendFile(path.join(__dirname, './newfrontend/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
  console.log(\`Serving static files from: \${path.join(__dirname, 'newfrontend')}\`);
  console.log('API endpoints available at: /api/health, /api/gold-rupee, /api/econ-data, /api/financial');
});
`;

// Write the clean server.js
fs.writeFileSync(serverPath, cleanServerJs);
console.log('✅ Created clean server.js with properly ordered routes');

// Create a dedicated test suite for the API endpoint
console.log('\n2️⃣ Creating API test script...');

const apiTestScript = `// filepath: /c:/rswport2.0/test-api-gold-rupee.js
const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Gold-Rupee API endpoint');

// Function to make a GET request
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    console.log(\`Making request to \${url}\`);
    
    const req = http.get(url, (res) => {
      let data = '';
      
      // Log response headers and status code
      console.log(\`Status Code: \${res.statusCode}\`);
      console.log('Response Headers:', res.headers);
      
      // Collect response data
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      // Process complete response
      res.on('end', () => {
        try {
          // Check if the response is HTML or JSON
          const contentType = res.headers['content-type'] || '';
          const isHtml = contentType.includes('html') || data.trim().startsWith('<!DOCTYPE') || data.trim().startsWith('<html');
          const isJson = contentType.includes('json') || (data.trim().startsWith('{') && data.trim().endsWith('}'));
          
          console.log(\`Response appears to be \${isHtml ? 'HTML' : isJson ? 'JSON' : 'unknown format'}\`);
          
          // Try to parse as JSON if it looks like JSON
          const result = {
            statusCode: res.statusCode,
            headers: res.headers,
            data: isJson ? JSON.parse(data) : data,
            isHtml,
            isJson
          };
          
          resolve(result);
        } catch (error) {
          console.error('Error processing response:', error.message);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });
    
    // Set a timeout
    req.setTimeout(10000, () => {
      req.abort();
      reject(new Error('Request timed out'));
    });
  });
}

// Main test function
async function runTests() {
  try {
    // Test 1: Direct API endpoint access
    console.log('\\n📡 TEST 1: Testing /api/gold-rupee endpoint...');
    const result = await makeRequest('http://localhost:3001/api/gold-rupee');
    
    if (result.isHtml) {
      console.error('❌ ERROR: Endpoint is returning HTML instead of JSON!');
      console.log('This means the API route is not being handled properly.');
      console.log('HTML snippet:', result.data.substring(0, 100) + '...');
      
      // Second attempt with extra header
      console.log('\\n📡 Trying again with Accept: application/json header...');
      const headers = { 'Accept': 'application/json' };
      const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/gold-rupee',
        headers
      };
      
      http.get(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log(\`Status Code: \${res.statusCode}\`);
          console.log('Response Headers:', res.headers);
          
          const contentType = res.headers['content-type'] || '';
          const isJson = contentType.includes('json');
          console.log('Response is JSON:', isJson);
          
          if (isJson) {
            console.log('✅ Success with Accept header! The API is working.');
            console.log('Data sample:', JSON.parse(data).slice(0, 2));
          } else {
            console.log('❌ Still getting HTML. Your server is not handling API routes correctly.');
          }
        });
      }).on('error', err => console.error('Error:', err));
    } else if (result.isJson) {
      console.log('✅ SUCCESS: Endpoint returned valid JSON data');
      
      // Analyze the data
      if (Array.isArray(result.data)) {
        console.log(\`Received array with \${result.data.length} items\`);
        console.log('First item:', result.data[0]);
      } else if (result.data.data && Array.isArray(result.data.data)) {
        console.log(\`Received object with data array containing \${result.data.data.length} items\`);
        console.log('First item:', result.data.data[0]);
      } else if (result.data.goldData && Array.isArray(result.data.goldData)) {
        console.log(\`Received object with goldData array containing \${result.data.goldData.length} items\`);
        console.log('First item:', result.data.goldData[0]);
      }
    } else {
      console.log('❌ ERROR: Endpoint returned neither HTML nor valid JSON.');
      console.log('Response data:', result.data.substring(0, 100) + '...');
    }
    
    // Create sample data file if needed
    if (result.statusCode === 404 || result.data?.error === 'Data file not found') {
      await createSampleDataFile();
    }
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    
    // Check if the server is running
    console.log('\\nChecking if server is running on port 3001...');
    try {
      await makeRequest('http://localhost:3001/api/health');
    } catch (e) {
      console.error('❌ Could not connect to server. Make sure it\'s running with: node server.js');
    }
  }
}

// Create sample data file if needed
async function createSampleDataFile() {
  console.log('\\n📁 Creating sample gold-rupee data file...');
  
  const sampleData = {
    data: generateSampleGoldRupeeData()
  };
  
  // Create directory if needed
  const dataDir = './data';
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('Created data directory');
  }
  
  const filePath = path.join(dataDir, 'gold_rupee_data.json');
  fs.writeFileSync(filePath, JSON.stringify(sampleData, null, 2));
  console.log(\`✅ Created sample data at \${filePath}\`);
  
  return filePath;
}

// Generate sample gold price and USD/INR exchange rate data
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

// Direct API test script
runTests();
`;

fs.writeFileSync('./test-api-gold-rupee.js', apiTestScript);
console.log('✅ Created API test script at ./test-api-gold-rupee.js');

// Also fix the Vercel API endpoint to be consistent
console.log('\n3️⃣ Updating Vercel API endpoint...');

const apiDir = './api';
const apiFilePath = path.join(apiDir, 'gold-rupee.js');

// Create api directory if needed
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
}

// Create or update the gold-rupee.js endpoint file
const vercelApiEndpoint = `// Gold Price vs. USD/INR Exchange Rate API (Vercel serverless function)
const fs = require('fs');
const path = require('path');

// Find the data file
function findDataFile() {
  const possiblePaths = [
    path.join(process.cwd(), 'newfrontend/data/gold_rupee_data.json'),
    path.join(process.cwd(), 'newfrontend/data/gold-rupee-data.json'),
    path.join(process.cwd(), 'data/gold_rupee_data.json'),
    path.join(process.cwd(), 'backend/data/gold_rupee_data.json')
  ];
  
  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      console.log('Found data file:', filePath);
      return filePath;
    }
  }
  
  return null;
}

// API handler
module.exports = (req, res) => {
  // Explicitly log that this Vercel API endpoint was called
  console.log('Vercel API endpoint /api/gold-rupee called');
  
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');
    
    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Find the data file
    const dataFile = findDataFile();
    
    if (!dataFile) {
      console.error('No data file found');
      return res.status(404).json({
        error: 'Data file not found',
        message: 'Could not locate gold_rupee_data.json'
      });
    }
    
    // Read the data file
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    
    // Filter for 5-year range
    const now = new Date();
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(now.getFullYear() - 5);
    
    let filteredData;
    
    // Handle different data formats
    if (Array.isArray(data)) {
      // Simple array format
      filteredData = data.filter(item => new Date(item.date) >= fiveYearsAgo);
    } else if (data.data && Array.isArray(data.data)) {
      // Object with data array
      data.data = data.data.filter(item => new Date(item.date) >= fiveYearsAgo);
      filteredData = data;
    } else if (data.goldData && Array.isArray(data.goldData)) {
      // Object with separate gold and rupee arrays
      data.goldData = data.goldData.filter(item => new Date(item.date) >= fiveYearsAgo);
      
      if (data.rupeeData && Array.isArray(data.rupeeData)) {
        data.rupeeData = data.rupeeData.filter(item => new Date(item.date) >= fiveYearsAgo);
      }
      
      filteredData = data;
    } else {
      // Unknown format, return as is
      filteredData = data;
    }
    
    console.log('Successfully processed gold-rupee data');
    
    // Return the data with explicit JSON content-type
    return res.status(200).json(filteredData);
  } catch (error) {
    console.error('Error in gold-rupee API:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
};
`;

fs.writeFileSync(apiFilePath, vercelApiEndpoint);
console.log(`✅ Updated Vercel API endpoint at ${apiFilePath}`);

// Create a simple direct test HTML page for the frontend
console.log('\n4️⃣ Creating API test HTML page...');

const testHtmlDir = './newfrontend';
if (!fs.existsSync(testHtmlDir)) {
  fs.mkdirSync(testHtmlDir, { recursive: true });
}

const testHtmlPath = path.join(testHtmlDir, 'api-test.html');
const testHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Test Page</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; }
    h1 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
    button { background: #4CAF50; color: white; border: none; padding: 10px 15px; cursor: pointer; margin: 10px 0; }
    button:hover { background: #45a049; }
    pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
    .error { color: red; }
  </style>
</head>
<body>
  <h1>Gold-Rupee API Test</h1>
  <p>This page tests the /api/gold-rupee endpoint.</p>
  
  <button id="testButton">Test API Endpoint</button>
  
  <h2>Response:</h2>
  <pre id="response">Click the button to test the API...</pre>
  
  <script>
    document.getElementById('testButton').addEventListener('click', async () => {
      const responseEl = document.getElementById('response');
      responseEl.textContent = 'Loading...';
      responseEl.className = '';
      
      try {
        // Test the API endpoint with explicit headers
        const response = await fetch('/api/gold-rupee', {
          headers: {
            'Accept': 'application/json'
          }
        });
        
        // Check if we got JSON
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('json');
        
        if (response.ok && isJson) {
          const data = await response.json();
          
          // Format the response
          const formattedData = JSON.stringify(data, null, 2);
          responseEl.textContent = \`SUCCESS! Status: \${response.status}\\n\\nResponse:\\n\${formattedData.substring(0, 500)}...\`;
          
          // Analyze the data further
          let recordCount;
          if (Array.isArray(data)) {
            recordCount = data.length;
          } else if (data.data && Array.isArray(data.data)) {
            recordCount = data.data.length;
          } else if (data.goldData && Array.isArray(data.goldData)) {
            recordCount = data.goldData.length;
          }
          
          if (recordCount) {
            responseEl.textContent += \`\\n\\nNumber of records: \${recordCount}\`;
          }
        } else {
          // We got a non-JSON response
          const text = await response.text();
          responseEl.className = 'error';
          
          if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
            responseEl.textContent = \`ERROR: Received HTML instead of JSON!\\n\\nThis means your API route is not being handled correctly.\\n\\nStatus: \${response.status}\\nContent-Type: \${contentType}\\n\\nFirst 300 characters:\\n\${text.substring(0, 300)}...\`;
          } else {
            responseEl.textContent = \`ERROR: Status \${response.status}\\nContent-Type: \${contentType}\\n\\nResponse:\\n\${text}\`;
          }
        }
      } catch (error) {
        responseEl.className = 'error';
        responseEl.textContent = \`ERROR: \${error.message}\`;
      }
    });
  </script>
</body>
</html>`;

fs.writeFileSync(testHtmlPath, testHtmlContent);
console.log(`✅ Created API test HTML page at ${testHtmlPath}`);

// Final instructions
console.log('\n✅ All fixes applied successfully!');
console.log('\nNext steps:');
console.log('1. Kill any running server instances');
console.log('2. Start server with: node server.js');
console.log('3. Test API endpoint with: node test-api-gold-rupee.js');
console.log('4. Visit http://localhost:3001/api-test.html in browser to test directly');
console.log('5. Access API directly at: http://localhost:3001/api/gold-rupee');
console.log('\nAfter verifying it works:');
console.log('1. Commit changes: git add . && git commit -m "Fix API endpoint routing order"');
console.log('2. Deploy: npx vercel --prod');
