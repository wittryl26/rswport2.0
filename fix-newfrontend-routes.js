const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing Vercel routing configuration for newfrontend directory...');

// Read current vercel.json
let vercelConfig;
try {
  vercelConfig = JSON.parse(fs.readFileSync('./vercel.json', 'utf8'));
  console.log('✅ Successfully loaded vercel.json');
} catch (err) {
  console.error('❌ Error loading vercel.json:', err.message);
  process.exit(1);
}

// Find which directories actually exist
const frontendExists = fs.existsSync('./Frontend');
const newfrontendExists = fs.existsSync('./newfrontend');
const backendExists = fs.existsSync('./backend');
const serverJsExists = fs.existsSync('./server.js');
const backendServerJsExists = fs.existsSync('./backend/server.js');

console.log('\nDirectories and files status:');
console.log(`- Frontend directory: ${frontendExists ? '✅ Found' : '❌ Not found'}`);
console.log(`- newfrontend directory: ${newfrontendExists ? '✅ Found' : '❌ Not found'}`);
console.log(`- backend directory: ${backendExists ? '✅ Found' : '❌ Not found'}`);
console.log(`- root server.js: ${serverJsExists ? '✅ Found' : '❌ Not found'}`);
console.log(`- backend/server.js: ${backendServerJsExists ? '✅ Found' : '❌ Not found'}`);

// Check if newfrontend/index.html exists
const newfrontendIndexExists = newfrontendExists && fs.existsSync('./newfrontend/index.html');
console.log(`- newfrontend/index.html: ${newfrontendIndexExists ? '✅ Found' : '❌ Not found'}`);

console.log('\n🔍 From your debug report:');
console.log('- You renamed the directory to "newfrontend"');
console.log('- API route returning HTML error instead of JSON');

// Determine correct configuration based on what actually exists
let correctOutputDir = 'newfrontend'; // Use newfrontend
let correctServerPath = serverJsExists ? 'server.js' : (backendServerJsExists ? 'backend/server.js' : 'server.js');

// Create the corrected vercel.json
const updatedConfig = {
  ...vercelConfig,
  outputDirectory: correctOutputDir
};

// Fix the routes to make sure they point to the correct locations
if (Array.isArray(updatedConfig.routes)) {
  // Find and fix API route
  const apiRouteIndex = updatedConfig.routes.findIndex(route => 
    route.src && route.src.includes('/api/')
  );
  
  if (apiRouteIndex >= 0) {
    updatedConfig.routes[apiRouteIndex].dest = correctServerPath;
    console.log(`\n✅ Updated API route to point to ${correctServerPath}`);
  }
  
  // Fix static file route if it exists
  const staticRouteIndex = updatedConfig.routes.findIndex(route => 
    route.src && route.src === '/(.*)'
  );
  
  if (staticRouteIndex >= 0) {
    updatedConfig.routes[staticRouteIndex].dest = 'newfrontend/$1';
    console.log('✅ Updated static file route to use newfrontend/$1');
  }
} else {
  updatedConfig.routes = [
    {
      "src": "/api/(.*)",
      "dest": correctServerPath
    },
    {
      "src": "/(.*)",
      "dest": "newfrontend/$1"
    }
  ];
  console.log('✅ Created new routes configuration');
}

// Add or fix builds section if needed
if (!updatedConfig.builds || !Array.isArray(updatedConfig.builds)) {
  updatedConfig.builds = [];
}

// Check if we have correct build entries
const hasNodeBuild = updatedConfig.builds.some(build => 
  build.src === correctServerPath || build.src === 'server.js' || build.src === 'backend/server.js'
);

const hasStaticBuild = updatedConfig.builds.some(build => 
  build.src && build.src.includes('newfrontend')
);

if (!hasNodeBuild) {
  updatedConfig.builds.push({
    "src": correctServerPath,
    "use": "@vercel/node"
  });
  console.log(`✅ Added Node.js build entry for ${correctServerPath}`);
}

if (!hasStaticBuild) {
  updatedConfig.builds.push({
    "src": "newfrontend/**/*",
    "use": "@vercel/static"
  });
  console.log('✅ Added static build entry for newfrontend/**/*');
}

// Write the updated config
fs.writeFileSync('./vercel.json', JSON.stringify(updatedConfig, null, 2));
console.log('\n✅ Updated vercel.json with corrected configuration');

// Create or check basic API health endpoint
if (!fs.existsSync('./api/health.js')) {
  console.log('\n🔧 Creating API health endpoint...');
  
  // Create api directory if it doesn't exist
  if (!fs.existsSync('./api')) {
    fs.mkdirSync('./api', { recursive: true });
    console.log('✅ Created api/ directory');
  }
  
  // Create a simple health endpoint
  const healthEndpoint = `// Simple health check endpoint
module.exports = (req, res) => {
  res.json({
    status: 'ok',
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
};`;

  fs.writeFileSync('./api/health.js', healthEndpoint);
  console.log('✅ Created api/health.js endpoint');
}

// Create simple index.html in newfrontend if needed
if (!newfrontendIndexExists && newfrontendExists) {
  console.log('\n🔧 Creating basic index.html in newfrontend directory...');
  
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ryland Wittman Portfolio</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; }
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #2c3e50; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Ryland Wittman</h1>
    <p>Portfolio site loading... If you continue to see this message, the site may still be deploying.</p>
  </div>
  
  <script>
    // Check if the API is working
    fetch('/api/health')
      .then(response => response.json())
      .then(data => {
        console.log('API health check:', data);
        document.querySelector('.container').innerHTML += '<p>✅ API connection successful</p>';
      })
      .catch(err => {
        console.error('API health check failed:', err);
        document.querySelector('.container').innerHTML += '<p>❌ API connection failed: ' + err.message + '</p>';
      });
  </script>
</body>
</html>`;

  fs.writeFileSync('./newfrontend/index.html', indexHtml);
  console.log('✅ Created basic newfrontend/index.html');
}

// Create simple server.js if needed
if (!serverJsExists && !backendServerJsExists) {
  console.log('\n🔧 Creating simple server.js in root directory...');
  
  const serverJs = `// Basic Express server for API
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
});

// Basic API endpoint example
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Ryland Wittman Portfolio API',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Vercel serverless deployment
if (process.env.VERCEL) {
  // For Vercel, we export the Express app
  module.exports = app;
} else {
  // For local development, we start the server
  app.listen(port, () => {
    console.log(\`Server running on port \${port}\`);
  });
}`;

  fs.writeFileSync('./server.js', serverJs);
  console.log('✅ Created simple server.js');
}

// Create debug.html in newfrontend
const debugHtmlPath = path.join('./newfrontend', 'debug.html');
const debugHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Vercel Deployment Debug</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; line-height: 1.5; }
    .container { max-width: 800px; margin: 0 auto; background: #f5f5f5; padding: 20px; border-radius: 5px; }
    h1 { color: #333; }
    .status { margin: 20px 0; padding: 15px; border-radius: 4px; }
    .success { background-color: #dff2bf; color: #4f8a10; }
    .error { background-color: #ffbaba; color: #d8000c; }
    pre { background: #333; color: #fff; padding: 10px; border-radius: 4px; overflow-x: auto; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Vercel Deployment Debug Page</h1>
    <div class="status success">
      <p>If you can see this page, your static files are being served correctly!</p>
    </div>
    
    <h2>Configuration:</h2>
    <pre>${JSON.stringify(updatedConfig, null, 2)}</pre>
    
    <h2>Next Steps:</h2>
    <p>Test your API endpoint: <a href="/api/health" target="_blank">/api/health</a></p>
    
    <div id="api-result" class="status"></div>
  </div>
  
  <script>
    // Check if API is working
    fetch('/api/health')
      .then(response => response.json())
      .then(data => {
        const div = document.getElementById('api-result');
        div.className = 'status success';
        div.innerHTML = '<p>API endpoint /api/health is working! Response:</p><pre>' + JSON.stringify(data, null, 2) + '</pre>';
      })
      .catch(err => {
        const div = document.getElementById('api-result');
        div.className = 'status error';
        div.innerHTML = '<p>API endpoint /api/health is not responding:</p><pre>' + err.message + '</pre>';
      });
  </script>
</body>
</html>`;

try {
  fs.writeFileSync(debugHtmlPath, debugHtml);
  console.log(`\n✅ Created debug page at ${debugHtmlPath}`);
} catch (err) {
  console.error(`Error writing debug HTML: ${err.message}`);
}

console.log('\n✅ All fixes applied! Now try these steps:');
console.log('1. Commit your changes: git add . && git commit -m "Fix Vercel routes for newfrontend"');
console.log('2. Push to GitHub: git push');
console.log('3. Deploy to Vercel again: vercel --prod');
console.log('\nAfter deploying, your site should now be accessible at the root URL');
