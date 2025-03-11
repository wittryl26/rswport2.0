// filepath: /c:/rswport2.0/test-api-gold-rupee.js
const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Gold-Rupee API endpoint');

// Function to make a GET request
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    console.log(`Making request to ${url}`);
    
    const req = http.get(url, (res) => {
      let data = '';
      
      // Log response headers and status code
      console.log(`Status Code: ${res.statusCode}`);
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
          
          console.log(`Response appears to be ${isHtml ? 'HTML' : isJson ? 'JSON' : 'unknown format'}`);
          
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
    console.log('\n📡 TEST 1: Testing /api/gold-rupee endpoint...');
    const result = await makeRequest('http://localhost:3001/api/gold-rupee');
    
    if (result.isHtml) {
      console.error('❌ ERROR: Endpoint is returning HTML instead of JSON!');
      console.log('This means the API route is not being handled properly.');
      console.log('HTML snippet:', result.data.substring(0, 100) + '...');
      
      // Second attempt with extra header
      console.log('\n📡 Trying again with Accept: application/json header...');
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
          console.log(`Status Code: ${res.statusCode}`);
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
        console.log(`Received array with ${result.data.length} items`);
        console.log('First item:', result.data[0]);
      } else if (result.data.data && Array.isArray(result.data.data)) {
        console.log(`Received object with data array containing ${result.data.data.length} items`);
        console.log('First item:', result.data.data[0]);
      } else if (result.data.goldData && Array.isArray(result.data.goldData)) {
        console.log(`Received object with goldData array containing ${result.data.goldData.length} items`);
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
    console.log('\nChecking if server is running on port 3001...');
    try {
      await makeRequest('http://localhost:3001/api/health');
    } catch (e) {
      console.error('❌ Could not connect to server. Make sure it's running with: node server.js');
    }
  }
}

// Create sample data file if needed
async function createSampleDataFile() {
  console.log('\n📁 Creating sample gold-rupee data file...');
  
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
  console.log(`✅ Created sample data at ${filePath}`);
  
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
