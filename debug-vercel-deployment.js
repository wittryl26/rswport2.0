const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging Vercel Deployment 404 Issues');

// Read current vercel.json
let vercelConfig;
try {
  vercelConfig = JSON.parse(fs.readFileSync('./vercel.json', 'utf8'));
  console.log('✅ Successfully loaded vercel.json');
} catch (err) {
  console.error('❌ Error loading vercel.json:', err.message);
  process.exit(1);
}

// Check if index.html exists in the outputDirectory
const outputDir = vercelConfig.outputDirectory || 'newfrontend';
console.log(`\nVercel outputDirectory: ${outputDir}`);

let indexExists = false;
let rootFiles = [];
try {
  if (fs.existsSync(outputDir)) {
    rootFiles = fs.readdirSync(outputDir);
    indexExists = fs.existsSync(path.join(outputDir, 'index.html'));
    console.log(`Directory "${outputDir}" exists: ${indexExists ? '✅ has index.html' : '❌ no index.html'}`);
    console.log(`Root files in ${outputDir}:`, rootFiles.slice(0, 10));
    if (rootFiles.length > 10) console.log(`...and ${rootFiles.length - 10} more files`);
  } else {
    console.error(`❌ Output directory "${outputDir}" doesn't exist!`);
  }
} catch (err) {
  console.error(`Error checking output directory: ${err.message}`);
}

// Check for server.js and API routes
const serverPath = './server.js';
const backendServerPath = './backend/server.js';
const serverExists = fs.existsSync(serverPath);
const backendServerExists = fs.existsSync(backendServerPath);

console.log(`\nServer file existence:`);
console.log(`- server.js: ${serverExists ? '✅ Found' : '❌ Not found'}`);
console.log(`- backend/server.js: ${backendServerExists ? '✅ Found' : '❌ Not found'}`);

// Check if vercel.json references the correct file
let serverReferencedInVercel = false;
vercelConfig.routes.forEach(route => {
  if (route.src && route.src.includes('/api/')) {
    console.log(`\nAPI route in vercel.json: ${route.src} → ${route.dest}`);
    
    if (route.dest === 'server.js' && serverExists) {
      serverReferencedInVercel = true;
      console.log('✅ API route correctly points to existing server.js');
    } else if (route.dest === 'backend/server.js' && backendServerExists) {
      serverReferencedInVercel = true;
      console.log('✅ API route correctly points to existing backend/server.js');
    } else {
      console.log(`❌ API route points to non-existent file: ${route.dest}`);
    }
  }
});

if (!serverReferencedInVercel) {
  console.log('❌ No API route in vercel.json or it points to the wrong server file');
}

// Updated vercel.json with fixes
console.log('\nFixes needed:');

let fixes = [];
if (!indexExists) {
  fixes.push(`• Create an index.html in the ${outputDir} directory`);
}

if (!serverReferencedInVercel) {
  const bestServerFile = backendServerExists ? 'backend/server.js' : (serverExists ? 'server.js' : null);
  if (bestServerFile) {
    fixes.push(`• Update vercel.json to point to ${bestServerFile}`);
  } else {
    fixes.push('• Create a server.js file in either root or backend directory');
  }
}

if (vercelConfig.outputDirectory !== 'newfrontend' && fs.existsSync('newfrontend')) {
  fixes.push('• Change outputDirectory in vercel.json to "newfrontend"');
}

// Generate updated vercel.json
if (fixes.length > 0) {
  console.log('The following issues need to be fixed:');
  fixes.forEach(fix => console.log(fix));
  
  // Create updated config
  const updatedConfig = { ...vercelConfig };
  
  if (vercelConfig.outputDirectory !== 'newfrontend' && fs.existsSync('newfrontend')) {
    updatedConfig.outputDirectory = 'newfrontend';
  }
  
  // Fix API route if needed
  const bestServerFile = backendServerExists ? 'backend/server.js' : (serverExists ? 'server.js' : null);
  if (bestServerFile) {
    const apiRouteIndex = updatedConfig.routes.findIndex(route => route.src && route.src.includes('/api/'));
    if (apiRouteIndex >= 0) {
      updatedConfig.routes[apiRouteIndex].dest = bestServerFile;
    }
  }
  
  console.log('\nUpdated vercel.json:');
  console.log(JSON.stringify(updatedConfig, null, 2));
  
  // Create a copy of the updated config
  fs.writeFileSync('./vercel.fixed.json', JSON.stringify(updatedConfig, null, 2));
  console.log('\n✅ Updated configuration written to vercel.fixed.json');
  
  console.log('\n🔧 To fix your deployment:');
  console.log('1. Review and update your vercel.json with the fixes above');
  console.log('2. Ensure that index.html exists in your output directory');
  console.log('3. Ensure your server.js file correctly handles API routes');
  console.log('4. Redeploy to Vercel');
} else {
  console.log('✅ No obvious configuration issues found.');
  console.log('\nOther things to check:');
  console.log('1. Are your static files organized properly in the newfrontend directory?');
  console.log('2. Does your server.js correctly handle API requests?');
  console.log('3. Are there any errors in your server logs?');
}

// Create basic vercel debug HTML
const debugHtmlPath = path.join(outputDir, 'debug.html');
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
    <pre>${JSON.stringify(vercelConfig, null, 2)}</pre>
    
    <h2>Files in ${outputDir}:</h2>
    <pre>${JSON.stringify(rootFiles, null, 2)}</pre>
    
    <h2>Next Steps:</h2>
    <p>If you're seeing a 404 on the main page but can access this debug page, check:</p>
    <ol>
      <li>Is your index.html in the correct location?</li>
      <li>Is your vercel.json routes section correct?</li>
      <li>Try to rename your output directory to match what's in vercel.json</li>
    </ol>
  </div>
  <script>
    // Check if API is working
    fetch('/api/health')
      .then(response => response.json())
      .then(data => {
        const div = document.createElement('div');
        div.className = 'status success';
        div.innerHTML = '<p>API endpoint /api/health is working! Response:</p><pre>' + JSON.stringify(data, null, 2) + '</pre>';
        document.querySelector('.container').appendChild(div);
      })
      .catch(err => {
        const div = document.createElement('div');
        div.className = 'status error';
        div.innerHTML = '<p>API endpoint /api/health is not responding:</p><pre>' + err.message + '</pre>';
        document.querySelector('.container').appendChild(div);
      });
  </script>
</body>
</html>
`;

// Write debug HTML to help diagnose issues
try {
  fs.writeFileSync(debugHtmlPath, debugHtml);
  console.log(`\n✅ Created debug page at ${debugHtmlPath}`);
  console.log('After deploying, visit https://your-vercel-url/debug.html to see if static files work');
} catch (err) {
  console.error(`Error writing debug HTML: ${err.message}`);
}
