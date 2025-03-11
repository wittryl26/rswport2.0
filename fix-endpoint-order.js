const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing API endpoint order in server.js');
console.log('This script ensures API routes are properly registered before the catch-all route');

// Path to server.js
const serverPath = './server.js';

// Check if server.js exists
if (!fs.existsSync(serverPath)) {
  console.error('❌ server.js not found!');
  process.exit(1);
}

// Create backup
const backupPath = `${serverPath}.backup-${Date.now()}`;
fs.copyFileSync(serverPath, backupPath);
console.log(`✅ Created backup of server.js at ${backupPath}`);

// Read server.js
let serverContent = fs.readFileSync(serverPath, 'utf8');

// The issue is that the catch-all route is being matched before specific API routes
// 1. Extract all route registrations
const apiRoutes = [];
const otherRoutes = [];
let catchAllRoute = null;

// Find all app.get() route registrations
const routeMatches = serverContent.match(/app\.get\([^)]+\)[^;]*;/g) || [];

routeMatches.forEach(routeCode => {
  if (routeCode.includes("app.get('*'")) {
    // This is the catch-all route
    catchAllRoute = routeCode;
  } else if (routeCode.includes('/api/')) {
    // This is an API route
    apiRoutes.push(routeCode);
  } else {
    // This is some other route
    otherRoutes.push(routeCode);
  }
});

console.log(`Found routes: ${apiRoutes.length} API routes, ${otherRoutes.length} other routes, catch-all: ${catchAllRoute ? 'yes' : 'no'}`);

// If we have a catch-all route, we need to make sure it comes after all API routes
if (catchAllRoute) {
  // Remove the catch-all route from the content
  serverContent = serverContent.replace(catchAllRoute, '');
  
  // Make sure each API route is properly defined and exists in the content
  apiRoutes.forEach(route => {
    if (!serverContent.includes(route)) {
      console.log(`API route not found in server content: ${route}`);
    }
  });
  
  // If we have a gold-rupee route, make sure it's properly defined
  const goldRupeeRoute = apiRoutes.find(route => route.includes('/gold-rupee'));
  if (goldRupeeRoute) {
    console.log(`Found gold-rupee route: ${goldRupeeRoute}`);
    // Make sure it uses the /api/ prefix
    if (!goldRupeeRoute.includes('/api/gold-rupee')) {
      const updatedRoute = goldRupeeRoute.replace('/gold-rupee', '/api/gold-rupee');
      console.log(`Updating gold-rupee route to use /api/ prefix: ${updatedRoute}`);
      serverContent = serverContent.replace(goldRupeeRoute, updatedRoute);
    }
  } else {
    // Create the gold-rupee API route if it doesn't exist
    console.log('Creating gold-rupee API route');
    const goldRupeeApiRoute = `
// Gold-rupee data endpoint
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
      return res.status(404).json({ error: 'Data file not found' }));
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
      processedData = { 
        ...jsonData,
        data: jsonData.data.filter(item => new Date(item.date) >= fiveYearsAgo) 
      };
    } else if (jsonData.goldData && Array.isArray(jsonData.goldData)) {
      // Object with separate arrays
      processedData = { 
        ...jsonData,
        goldData: jsonData.goldData.filter(item => new Date(item.date) >= fiveYearsAgo)
      };
      
      if (jsonData.rupeeData && Array.isArray(jsonData.rupeeData)) {
        processedData.rupeeData = jsonData.rupeeData.filter(item => new Date(item.date) >= fiveYearsAgo);
      }
    }
    
    return res.json(processedData);
  } catch (error) {
    console.error('Error in gold-rupee endpoint:', error);
    return res.status(500).json({ error: error.message });
  }
});`;

    // Find a good insertion point
    const listenIndex = serverContent.indexOf('app.listen');
    if (listenIndex !== -1) {
      const beforeListen = serverContent.substring(0, listenIndex);
      const afterListen = serverContent.substring(listenIndex);
      serverContent = beforeListen + goldRupeeApiRoute + '\n\n' + afterListen;
    }
  }
  
  // Add the catch-all route at the end
  const listenIndex = serverContent.indexOf('app.listen');
  if (listenIndex !== -1) {
    const beforeListen = serverContent.substring(0, listenIndex);
    const afterListen = serverContent.substring(listenIndex);
    serverContent = beforeListen + '\n// Catch-all route must be last\n' + catchAllRoute + '\n\n' + afterListen;
    console.log('✅ Moved catch-all route to after API routes');
  }
}

// Also add a diagnostic middleware to log all requests
const expressInit = serverContent.indexOf('app.use(express');
if (expressInit !== -1) {
  const beforeInit = serverContent.substring(0, expressInit);
  const afterInit = serverContent.substring(expressInit);
  const loggingMiddleware = `
// Request logging middleware
app.use((req, res, next) => {
  console.log(\`[REQUEST] \${req.method} \${req.url}\`);
  next();
});

`;
  serverContent = beforeInit + loggingMiddleware + afterInit;
  console.log('✅ Added request logging middleware');
}

// Write updated server.js
fs.writeFileSync(serverPath, serverContent);
console.log('✅ Updated server.js with correct route order');

// Create a direct test script that uses the API in the browser
const testHtmlPath = './newfrontend/test-api.html';
const testHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Test Page</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
    h1 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
    pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
    button { background: #4CAF50; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
    button:hover { background: #45a049; }
    .result { margin-top: 20px; }
    .error { color: red; }
  </style>
</head>
<body>
  <h1>Gold-Rupee API Test</h1>
  <p>This page tests the /api/gold-rupee endpoint.</p>
  
  <button id="testButton">Test API</button>
  <div id="loading" style="display: none;">Loading...</div>
  
  <div class="result">
    <h2>API Response:</h2>
    <pre id="response">Click the "Test API" button to see the response</pre>
  </div>
  
  <script>
    document.getElementById('testButton').addEventListener('click', async () => {
      const loading = document.getElementById('loading');
      const response = document.getElementById('response');
      
      loading.style.display = 'block';
      response.textContent = 'Fetching data...';
      
      try {
        const startTime = Date.now();
        const res = await fetch('/api/gold-rupee');
        const timeElapsed = Date.now() - startTime;
        
        if (res.ok) {
          const data = await res.json();
          
          // Find data length
          let recordCount = 'unknown';
          if (Array.isArray(data)) {
            recordCount = data.length;
          } else if (data.data && Array.isArray(data.data)) {
            recordCount = data.data.length;
          } else if (data.goldData && Array.isArray(data.goldData)) {
            recordCount = data.goldData.length;
          }
          
          response.innerHTML = \`✅ Success! Received \${recordCount} records in \${timeElapsed}ms\\n\\nSample data:\\n\${JSON.stringify(data, null, 2).substring(0, 500)}...\`;
        } else {
          response.innerHTML = \`❌ Error: \${res.status} \${res.statusText}\\n\${await res.text()}\`;
          response.classList.add('error');
        }
      } catch (error) {
        response.textContent = \`❌ Exception: \${error.message}\`;
        response.classList.add('error');
      } finally {
        loading.style.display = 'none';
      }
    });
  </script>
</body>
</html>`;

fs.writeFileSync(testHtmlPath, testHtmlContent);
console.log(`✅ Created API test page at ${testHtmlPath}`);
console.log('   Access it at: http://localhost:3001/test-api.html');

console.log('\nNext steps:');
console.log('1. Restart your server: node server.js');
console.log('2. Access the API test page: http://localhost:3001/test-api.html');
console.log('3. If everything works, add and commit your changes:');
console.log('   git add . && git commit -m "Fix API route order and add test page"');
console.log('4. Deploy to Vercel: npx vercel --prod');
