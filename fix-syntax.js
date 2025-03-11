const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing missing parenthesis in server code');

// Create backup of server.js
const serverPath = './server.js';
const backupPath = `${serverPath}.backup-${Date.now()}`;
fs.copyFileSync(serverPath, backupPath);
console.log(`✅ Created backup at ${backupPath}`);

// Minimal working server.js
const minimalServer = `
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware
app.use((req, res, next) => {
  console.log(\`[REQUEST] \${req.method} \${req.url}\`);
  next();
});

// API endpoint for gold-rupee data
app.get('/api/gold-rupee', (req, res) => {
  try {
    // Find data file
    const dataFiles = [
      path.join(__dirname, 'data/gold_rupee_data.json'),
      path.join(__dirname, 'newfrontend/data/gold_rupee_data.json'),
      path.join(__dirname, 'backend/data/gold_rupee_data.json')
    ];
    
    const dataFile = dataFiles.find(file => fs.existsSync(file));
    
    if (!dataFile) {
      return res.status(404).json({ error: 'Data file not found' });
    }
    
    // Read and process data
    const data = JSON.parse(fs.readFileSync(dataFile));
    
    // Filter for 5-year range
    const now = new Date();
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(now.getFullYear() - 5);
    
    // Handle different data formats
    let processedData = data;
    
    if (Array.isArray(data)) {
      processedData = data.filter(item => new Date(item.date) >= fiveYearsAgo);
    } else if (data.data && Array.isArray(data.data)) {
      processedData.data = data.data.filter(item => new Date(item.date) >= fiveYearsAgo);
    }
    
    // Set JSON headers explicitly
    res.setHeader('Content-Type', 'application/json');
    return res.json(processedData);
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Serve static files AFTER API routes
app.use(express.static('./newfrontend'));

// Catch-all route MUST be last
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './newfrontend/index.html'));
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});
`;

// Write minimal working server.js
fs.writeFileSync(serverPath, minimalServer);
console.log('✅ Created minimal working server.js');

// Also create a test script
const testScript = `
const http = require('http');

console.log('Testing API endpoint...');

http.get('http://localhost:3001/api/gold-rupee', (res) => {
  let data = '';
  
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Success! Got JSON response');
      console.log('Data sample:', json);
    } catch (e) {
      console.error('Error: Response is not valid JSON');
      console.error('Raw response:', data.substring(0, 500));
    }
  });
}).on('error', (e) => {
  console.error('Error:', e.message);
});
`;

fs.writeFileSync('test-endpoint.js', testScript);
console.log('✅ Created test script at test-endpoint.js');

console.log('\nNext steps:');
console.log('1. Start server: node server.js');
console.log('2. Test endpoint: node test-endpoint.js');
console.log('3. If needed, restore backup: cp', backupPath, 'server.js');
