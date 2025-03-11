const fs = require('fs');
const path = require('path');
const http = require('http');
const { exec, execSync } = require('child_process');

console.log('🔍 Debugging Gold Rupee Data API Endpoint');
console.log('This script will help fix the gold-rupee endpoint that isn\'t responding');

// 1. Check if server is running on port 3001
console.log('\n1️⃣ Checking if server is running on port 3001...');
function isPortInUse(port) {
  try {
    // Try to bind to the port - if it fails, something is already using it
    const server = http.createServer();
    return new Promise((resolve) => {
      server.once('error', () => {
        resolve(true); // Port is in use
      });
      server.once('listening', () => {
        server.close();
        resolve(false); // Port is available
      });
      server.listen(port);
    });
  } catch (err) {
    return Promise.resolve(true); // Assume port is in use if check fails
  }
}

// 2. Find gold-rupee data files
console.log('\n2️⃣ Looking for gold price and USD/INR exchange rate data files...');
const dataPaths = [
  './newfrontend/data/gold_rupee_data.json',
  './newfrontend/data/gold-rupee-data.json',
  './backend/data/gold_rupee_data.json',
  './data/gold_rupee_data.json'
];

let foundDataFiles = [];
dataPaths.forEach(path => {
  if (fs.existsSync(path)) {
    foundDataFiles.push(path);
    console.log(`✅ Found data file: ${path}`);
  } else {
    console.log(`❌ File not found: ${path}`);
  }
});

if (foundDataFiles.length === 0) {
  console.log('❌ No gold-rupee data files found! Creating a sample data file...');
  
  // Create a basic data file with sample data
  const sampleData = {
    data: generateSampleGoldRupeeData()
  };
  
  // Ensure the directory exists
  const dir = './newfrontend/data';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync('./newfrontend/data/gold_rupee_data.json', JSON.stringify(sampleData, null, 2));
  console.log('✅ Created sample gold-rupee data file at ./newfrontend/data/gold_rupee_data.json');
  foundDataFiles.push('./newfrontend/data/gold_rupee_data.json');
}

// 3. Check for and create API endpoint files
console.log('\n3️⃣ Checking API endpoint configuration...');

// Fix the API endpoint in the backend directory
const backendEndpoint = './backend/routes/gold-rupee.js';
if (!fs.existsSync(backendEndpoint)) {
  console.log(`Creating backend endpoint at ${backendEndpoint}...`);
  
  // Make sure the directory exists
  const dir = path.dirname(backendEndpoint);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Create the backend endpoint file
  const backendCode = `// Gold Price vs USD/INR Exchange Rate API Endpoint
const fs = require('fs');
const path = require('path');

// Find the gold-rupee data file
function findDataFile() {
  const possiblePaths = [
    path.join(__dirname, '../../newfrontend/data/gold_rupee_data.json'),
    path.join(__dirname, '../../newfrontend/data/gold-rupee-data.json'),
    path.join(__dirname, '../data/gold_rupee_data.json'),
    path.join(__dirname, '../../data/gold_rupee_data.json')
  ];
  
  for (const filePath of possiblePaths) {
    console.log('Checking for data file at:', filePath);
    if (fs.existsSync(filePath)) {
      console.log('Found data file:', filePath);
      return filePath;
    }
  }
  
  return null;
}

/**
 * GET /gold-rupee
 * Returns gold price and USD/INR exchange rate data
 */
exports.getGoldRupeeData = async (req, res) => {
  console.log('Gold-rupee API endpoint called');
  
  try {
    // Find the data file
    const dataFile = findDataFile();
    
    if (!dataFile) {
      console.error('No gold-rupee data file found!');
      return res.status(404).json({ error: 'Data file not found' });
    }
    
    // Read the data
    const jsonData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    console.log(\`Read \${dataFile} successfully\`);
    
    // Filter to include only last 5 years
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
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    // Return the data
    return res.json(processedData);
  } catch (error) {
    console.error('Error in gold-rupee endpoint:', error);
    return res.status(500).json({ error: error.message });
  }
};
`;
  
  fs.writeFileSync(backendEndpoint, backendCode);
  console.log(`✅ Created backend endpoint at ${backendEndpoint}`);
}

// Fix the Vercel API endpoint file
const vercelEndpoint = './api/gold-rupee.js';
if (!fs.existsSync(vercelEndpoint)) {
  console.log(`Creating Vercel API endpoint at ${vercelEndpoint}...`);
  
  // Make sure the directory exists
  const dir = path.dirname(vercelEndpoint);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Create the Vercel API endpoint file
  const vercelCode = `// Gold Price vs. USD/INR Exchange Rate API (Vercel serverless function)
const fs = require('fs');
const path = require('path');

// Find the gold-rupee data file
function findDataFile() {
  const possiblePaths = [
    path.join(process.cwd(), 'newfrontend/data/gold_rupee_data.json'),
    path.join(process.cwd(), 'newfrontend/data/gold-rupee-data.json'),
    path.join(process.cwd(), 'backend/data/gold_rupee_data.json'),
    path.join(process.cwd(), 'data/gold_rupee_data.json')
  ];
  
  for (const filePath of possiblePaths) {
    console.log('Checking for data file at:', filePath);
    if (fs.existsSync(filePath)) {
      console.log('Found data file:', filePath);
      return filePath;
    }
  }
  
  return null;
}

// API handler for Vercel
module.exports = (req, res) => {
  console.log('Vercel gold-rupee API endpoint called');
  
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Find the data file
    const dataFile = findDataFile();
    
    if (!dataFile) {
      console.error('No gold-rupee data file found!');
      return res.status(404).json({
        error: 'Data file not found',
        message: 'Could not locate gold_rupee_data.json'
      });
    }
    
    // Read the data file
    const jsonData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    console.log(\`Read \${dataFile} successfully\`);
    
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
    
    // Return the data
    return res.status(200).json(processedData);
  } catch (error) {
    console.error('Error in gold-rupee API:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
};
`;

  fs.writeFileSync(vercelEndpoint, vercelCode);
  console.log(`✅ Created Vercel API endpoint at ${vercelEndpoint}`);
}

// 4. Update server.js to make sure it registers the gold-rupee endpoint
console.log('\n4️⃣ Updating server.js to register the gold-rupee endpoint...');

let serverFiles = ['./server.js', './backend/server.js'];
let serverUpdated = false;

for (const serverFile of serverFiles) {
  if (fs.existsSync(serverFile)) {
    console.log(`Checking ${serverFile}...`);
    
    // Create a backup first
    fs.copyFileSync(serverFile, `${serverFile}.backup-${Date.now()}`);
    
    const content = fs.readFileSync(serverFile, 'utf8');
    
    // Check if gold-rupee route is already registered
    if (!content.includes('/gold-rupee') && !content.includes('gold-rupee')) {
      console.log('Adding gold-rupee route to server...');
      
      let updatedContent = content;
      
      // For Express-style app.get('/route') pattern
      if (content.includes('app.get(')) {
        const insertPoint = content.lastIndexOf('app.get(');
        if (insertPoint !== -1) {
          // Find the end of the block
          const blockEnd = content.indexOf('});', insertPoint);
          if (blockEnd !== -1) {
            const routeCode = `
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

`;
            updatedContent = 
              content.slice(0, blockEnd + 3) + 
              routeCode +
              content.slice(blockEnd + 3);
          }
        }
      } 
      // For route module import pattern
      else if (content.includes('require(') && content.includes('routes')) {
        // Look for route imports
        const routeImportSection = content.match(/const\s+\w+\s*=\s*require\(['"]\.\/(routes|api)\/[^)]+['"]\)/g);
        if (routeImportSection) {
          const lastImport = routeImportSection[routeImportSection.length - 1];
          const insertPoint = content.indexOf(lastImport) + lastImport.length;
          
          // Add gold-rupee route import
          const newImport = `\nconst goldRupeeRoutes = require('./routes/gold-rupee');`;
          
          updatedContent = 
            content.slice(0, insertPoint) + 
            newImport +
            content.slice(insertPoint);
          
          // Look for where routes are used/registered
          const routeUseMatch = content.match(/app\.use\(['"]\/(api\/)?[^'"]+['"]\s*,\s*\w+Routes\s*\)/g);
          if (routeUseMatch) {
            const lastRouteUse = routeUseMatch[routeUseMatch.length - 1];
            const useInsertPoint = content.indexOf(lastRouteUse) + lastRouteUse.length;
            
            // Add route registration
            const newRouteUse = `\napp.use('/gold-rupee', goldRupeeRoutes);`;
            
            updatedContent = 
              updatedContent.slice(0, useInsertPoint) + 
              newRouteUse +
              updatedContent.slice(useInsertPoint);
          }
          // For more direct usage pattern
          else {
            const directUsageMatch = content.match(/app\.get\(['"]\/(api\/)?[^'"]+['"]\s*,\s*\w+\.\w+\s*\)/g);
            if (directUsageMatch) {
              const lastDirectUse = directUsageMatch[directUsageMatch.length - 1];
              const useInsertPoint = content.indexOf(lastDirectUse) + lastDirectUse.length;
              
              // Add direct route usage
              const newDirectUse = `\napp.get('/gold-rupee', goldRupeeRoutes.getGoldRupeeData);`;
              
              updatedContent = 
                updatedContent.slice(0, useInsertPoint) + 
                newDirectUse +
                updatedContent.slice(useInsertPoint);
            }
          }
        }
      }
      
      // Save the updated content
      if (updatedContent !== content) {
        fs.writeFileSync(serverFile, updatedContent);
        console.log(`✅ Updated ${serverFile} with gold-rupee endpoint`);
        serverUpdated = true;
      } else {
        console.log(`⚠️ Could not automatically update ${serverFile}`);
      }
    } else {
      console.log(`✅ ${serverFile} already contains gold-rupee endpoint`);
      serverUpdated = true;
    }
  }
}

if (!serverUpdated) {
  console.log('⚠️ Could not update any server file automatically');
}

// 5. Ensure Express is properly installed
console.log('\n5️⃣ Checking for Express.js installation...');
try {
  const packageJsonPath = './package.json';
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (!packageJson.dependencies || !packageJson.dependencies.express) {
      console.log('Express not found in package.json. Installing...');
      execSync('npm install express', { stdio: 'inherit' });
      console.log('✅ Express installed successfully');
    } else {
      console.log('✅ Express already installed');
    }
  }
} catch (err) {
  console.error('Error checking Express installation:', err.message);
}

// Run the server check
async function checkServerAndEndpoint() {
  console.log('\n6️⃣ Checking if server is running on port 3001...');
  
  const portInUse = await isPortInUse(3001);
  if (!portInUse) {
    console.log('❌ No server appears to be running on port 3001');
    console.log('Starting server...');
    
    // Find the best server file to run
    const serverFile = fs.existsSync('./server.js') ? './server.js' : 
                      (fs.existsSync('./backend/server.js') ? './backend/server.js' : null);
    
    if (serverFile) {
      console.log(`Running: node ${serverFile}`);
      console.log('Please wait while the server starts...');
      
      // Start the server in a detached process
      const child = exec(`node ${serverFile}`);
      
      // Echo the output
      child.stdout.on('data', (data) => {
        console.log(`Server output: ${data}`);
      });
      
      child.stderr.on('data', (data) => {
        console.error(`Server error: ${data}`);
      });
      
      // Wait for server to possibly start
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('Server process started. Check if it\'s responsive...');
    } else {
      console.error('❌ No server.js file found to run!');
      return;
    }
  } else {
    console.log('✅ A server appears to be running on port 3001');
  }
  
  // Check if the gold-rupee endpoint is accessible
  console.log('\n7️⃣ Testing the gold-rupee endpoint...');
  try {
    console.log('Sending request to http://localhost:3001/gold-rupee');
    console.log('This may take a few seconds...');
    
    const testRequest = (url) => {
      return new Promise((resolve, reject) => {
        http.get(url, (resp) => {
          let data = '';
          resp.on('data', (chunk) => { data += chunk; });
          resp.on('end', () => {
            resolve({
              status: resp.statusCode,
              data: data
            });
          });
        }).on('error', (err) => {
          reject(err);
        });
      });
    };
    
    // Try the endpoint
    const result = await testRequest('http://localhost:3001/gold-rupee');
    
    if (result.status === 200) {
      console.log('✅ Endpoint is responding with status 200');
      try {
        const parsedData = JSON.parse(result.data);
        if (parsedData) {
          console.log('✅ Endpoint is returning valid JSON data');
          
          // Check data structure
          if (Array.isArray(parsedData)) {
            console.log(`✅ Received array data with ${parsedData.length} records`);
          } else if (parsedData.data && Array.isArray(parsedData.data)) {
            console.log(`✅ Received object with data array containing ${parsedData.data.length} records`);
          } else if (parsedData.goldData && Array.isArray(parsedData.goldData)) {
            console.log(`✅ Received object with goldData array containing ${parsedData.goldData.length} records`);
          } else {
            console.log('⚠️ Received data in an unexpected format');
          }
        }
      } catch (e) {
        console.error('❌ Endpoint returned invalid JSON:', e.message);
      }
    } else {
      console.error(`❌ Endpoint responded with status ${result.status}`);
      console.log('Response data:', result.data);
    }
  } catch (err) {
    console.error('❌ Error testing endpoint:', err.message);
    console.log('\nThis could indicate the server is not running or the endpoint is not properly configured.');
  }
  
  console.log('\n✅ Setup and checks completed.');
  console.log('\nTroubleshooting tips if endpoint still doesn\'t work:');
  console.log('1. Make sure your server has restarted with the new changes');
  console.log('2. Check server logs for any errors');
  console.log('3. Try accessing the endpoint directly in your browser: http://localhost:3001/gold-rupee');
  console.log('4. Verify data file exists and is valid JSON');
  console.log('\nFor Vercel deployment:');
  console.log('1. Deploy again with: npx vercel --prod');
  console.log('2. Test the endpoint at: https://your-vercel-url/api/gold-rupee');
}

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

// Run the server check
checkServerAndEndpoint();
