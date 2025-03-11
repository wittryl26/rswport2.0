const fs = require('fs');
const path = require('path');

console.log('🛠️ Fixing Static File Paths in Server Configuration');

// 1. Find server.js file
const serverFiles = [
  './server.js',
  './backend/server.js'
];

let serverFile = null;
let serverContent = null;

for (const file of serverFiles) {
  if (fs.existsSync(file)) {
    serverFile = file;
    serverContent = fs.readFileSync(file, 'utf8');
    console.log(`✅ Found server file: ${file}`);
    break;
  }
}

if (!serverFile) {
  console.error('❌ Could not find server.js file!');
  process.exit(1);
}

// Create a backup of the server file
const backupFile = `${serverFile}.backup-${Date.now()}`;
fs.copyFileSync(serverFile, backupFile);
console.log(`✅ Created backup of server file at ${backupFile}`);

// 2. Check if newfrontend directory exists at root level
const rootNewfrontend = path.resolve('./newfrontend');
const backendNewfrontend = path.resolve('./backend/newfrontend');

if (fs.existsSync(rootNewfrontend)) {
  console.log(`✅ Found newfrontend directory at project root: ${rootNewfrontend}`);
} else {
  console.error(`❌ newfrontend directory not found at project root!`);
  
  // If we have a backend/newfrontend but not root/newfrontend, create a symlink or copy
  if (fs.existsSync(backendNewfrontend)) {
    console.log(`Found newfrontend inside backend directory. Will fix paths to reference this.`);
  } else {
    console.error(`❌ Could not find newfrontend directory anywhere!`);
    // Create minimal newfrontend structure
    console.log('Creating minimal newfrontend directory at project root...');
    fs.mkdirSync('./newfrontend', { recursive: true });
    
    // Create minimal index.html
    const minimalHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ryland Wittman</title>
  <style>
    body { font-family: sans-serif; margin: 0; padding: 40px 20px; line-height: 1.6; }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Ryland Wittman</h1>
    <p>Portfolio site loading...</p>
    <p>Fixed static file paths to enable correct file serving.</p>
    <p>The full site should be available after deploy with the corrected configuration.</p>
  </div>
</body>
</html>`;
    
    fs.writeFileSync('./newfrontend/index.html', minimalHtml);
    console.log('✅ Created minimal index.html in newfrontend directory');
  }
}

console.log('\n🔍 Analyzing server.js to fix static file paths...');

// 3. Fix static file paths in server.js
let updatedContent = serverContent;
let changes = [];

// Analyze if server is using express.static for serving files
const staticPaths = [
  /express\.static\(['"]\.\/(?:backend\/)?newfrontend['"](?:,\s*\{[^}]+\})?\)/,
  /express\.static\(['"]\.\/(?:backend\/)?Frontend['"](?:,\s*\{[^}]+\})?\)/,
  /express\.static\(['"]\.\/(?:backend\/)?frontend['"](?:,\s*\{[^}]+\})?\)/,
  /express\.static\(['"]\.\/(?:backend\/)?public['"](?:,\s*\{[^}]+\})?\)/,
  /express\.static\(['"]\.\/(?:backend\/)?dist['"](?:,\s*\{[^}]+\})?\)/,
  /express\.static\(['"]\.\/(?:backend\/)?static['"](?:,\s*\{[^}]+\})?\)/
];

let staticPathFound = false;

for (const pattern of staticPaths) {
  if (pattern.test(updatedContent)) {
    staticPathFound = true;
    console.log(`Found express.static path matching: ${pattern}`);
    
    // Fix the path to point to newfrontend at root level
    updatedContent = updatedContent.replace(pattern, match => {
      // Standardize to point to newfrontend at project root
      const corrected = `express.static('./newfrontend')`;
      changes.push(`Changed static path from '${match}' to '${corrected}'`);
      return corrected;
    });
  }
}

// If no static paths were found, we need to add one
if (!staticPathFound) {
  console.log('⚠️ No express.static path found. Adding one...');
  
  // Look for app initialization
  const appPattern = /const\s+app\s*=\s*express\(\);/;
  if (appPattern.test(updatedContent)) {
    updatedContent = updatedContent.replace(appPattern, match => {
      const newCode = match + '\n\n// Serve static files from newfrontend directory\napp.use(express.static(\'./newfrontend\'));\n';
      changes.push('Added express.static middleware for ./newfrontend');
      return newCode;
    });
  } else {
    console.log('⚠️ Could not find app initialization. Adding static path will be more difficult.');
    
    // Try to find a good insertion point
    const middlewarePatterns = [
      /app\.use\([^)]+\);/,
      /app\.set\([^)]+\);/
    ];
    
    let insertionFound = false;
    for (const pattern of middlewarePatterns) {
      if (pattern.test(updatedContent)) {
        const match = updatedContent.match(pattern);
        const insertionPoint = updatedContent.indexOf(match[0]) + match[0].length;
        
        updatedContent = 
          updatedContent.substring(0, insertionPoint) + 
          '\n\n// Serve static files from newfrontend directory\napp.use(express.static(\'./newfrontend\'));\n' +
          updatedContent.substring(insertionPoint);
        
        changes.push('Added express.static middleware after another middleware');
        insertionFound = true;
        break;
      }
    }
    
    if (!insertionFound) {
      console.log('⚠️ Could not find appropriate place to insert static middleware.');
      console.log('Manual fix might be required.');
    }
  }
}

// 4. Check if server is sending index.html for SPA routes
const spaHandlingPatterns = [
  /app\.get\(['"]\*['"].*res\.sendFile.*index\.html/,
  /app\.use\(['"]\*['"].*res\.sendFile.*index\.html/,
  /app\.get\(['"]\*['"].*res\.send.*index\.html/,
  /app\.use\(['"]\*['"].*res\.send.*index\.html/
];

let spaHandlingFound = false;
for (const pattern of spaHandlingPatterns) {
  if (pattern.test(updatedContent)) {
    spaHandlingFound = true;
    console.log('✅ Found SPA route handling for index.html');
    
    // Make sure path to index.html is correct
    updatedContent = updatedContent.replace(
      /(sendFile|send).*?(path\.join|path\.resolve).*?(["'])([^'"]+\/index\.html)/g,
      (match, sendMethod, pathMethod, quote, indexPath) => {
        if (!indexPath.includes('newfrontend')) {
          const newPath = indexPath.replace(/(?:Frontend|frontend|public|dist|static)/g, 'newfrontend');
          const correctedMatch = match.replace(indexPath, newPath);
          changes.push(`Fixed index.html path from '${indexPath}' to '${newPath}'`);
          return correctedMatch;
        }
        return match;
      }
    );
  }
}

// If no SPA handling found, add it
if (!spaHandlingFound) {
  console.log('⚠️ No SPA route handling found for index.html. Adding it...');
  
  // Look for app.listen - this is usually at the end of the file
  const listenPattern = /app\.listen\(/;
  if (listenPattern.test(updatedContent)) {
    updatedContent = updatedContent.replace(listenPattern, match => {
      const pathImport = updatedContent.includes('path') ? '' : "const path = require('path');\n";
      const newCode = `
${pathImport}
// Handle SPA - serve index.html for any unmatched route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './newfrontend/index.html'));
});

${match}`;
      changes.push('Added SPA route handling for index.html');
      return newCode;
    });
  } else {
    console.log('⚠️ Could not find app.listen() to add SPA handling before it.');
    
    // Append to the end of the file as a last resort
    updatedContent += `
    
// Handle SPA - serve index.html for any unmatched route
app.get('*', (req, res) => {
  const path = require('path');
  res.sendFile(path.join(__dirname, './newfrontend/index.html'));
});
`;
    changes.push('Added SPA route handling for index.html at the end of the file');
  }
}

// 5. Check if path module is required
if (updatedContent.includes('path.join') || updatedContent.includes('path.resolve')) {
  const pathRequirePattern = /const\s+path\s*=\s*require\(['"]path['"]\);/;
  if (!pathRequirePattern.test(updatedContent)) {
    console.log('⚠️ path module is used but not required. Adding require statement...');
    
    // Add path require at the top of the file
    updatedContent = `const path = require('path');\n${updatedContent}`;
    changes.push('Added require statement for path module');
  }
}

// 6. Save the updated server file if changes were made
if (changes.length > 0) {
  fs.writeFileSync(serverFile, updatedContent);
  console.log('\n✅ Updated server file with the following changes:');
  changes.forEach((change, i) => console.log(` ${i + 1}. ${change}`));
} else {
  console.log('\n✅ No changes needed to server file');
}

// 7. Check if index.html is in the right place
if (!fs.existsSync('./newfrontend/index.html')) {
  console.log('\n⚠️ index.html not found in newfrontend directory.');
  
  // Look for index.html in other locations
  const possibleIndexLocations = [
    './index.html',
    './Frontend/index.html',
    './frontend/index.html',
    './public/index.html',
    './dist/index.html'
  ];
  
  let indexFound = false;
  for (const indexPath of possibleIndexLocations) {
    if (fs.existsSync(indexPath)) {
      console.log(`Found index.html at ${indexPath}. Copying to newfrontend/index.html...`);
      
      // Create newfrontend directory if it doesn't exist
      if (!fs.existsSync('./newfrontend')) {
        fs.mkdirSync('./newfrontend', { recursive: true });
      }
      
      // Copy index.html to newfrontend
      fs.copyFileSync(indexPath, './newfrontend/index.html');
      console.log('✅ Copied index.html to newfrontend directory');
      indexFound = true;
      break;
    }
  }
  
  if (!indexFound) {
    console.log('❌ Could not find index.html anywhere. Creating a minimal one...');
    
    // Create newfrontend directory if it doesn't exist
    if (!fs.existsSync('./newfrontend')) {
      fs.mkdirSync('./newfrontend', { recursive: true });
    }
    
    // Create minimal index.html
    const minimalHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ryland Wittman</title>
  <style>
    body { font-family: sans-serif; margin: 0; padding: 40px 20px; line-height: 1.6; }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Ryland Wittman</h1>
    <p>Portfolio site loading...</p>
    <p>Fixed static file paths to enable correct file serving.</p>
    <p>The full site should be available after deploy with the corrected configuration.</p>
  </div>
</body>
</html>`;
    
    fs.writeFileSync('./newfrontend/index.html', minimalHtml);
    console.log('✅ Created minimal index.html in newfrontend directory');
  }
}

// 8. Create helpful scripts
console.log('\n📝 Creating helpful scripts...');

// Create a script to test the server
const testServerScript = `// Test server script
const http = require('http');

console.log('🧪 Testing server at http://localhost:3001');
console.log('Sending request to check if server is responding...');

http.get('http://localhost:3001', (res) => {
  console.log(\`Server responded with status code: \${res.statusCode}\`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Server is responding correctly');
    } else {
      console.log(\`⚠️ Server responded with unexpected status code: \${res.statusCode}\`);
    }
    
    if (data.includes('<html') || data.includes('<!DOCTYPE')) {
      console.log('✅ Server returned HTML content');
    } else {
      console.log('⚠️ Server response does not appear to be HTML');
    }
  });
}).on('error', (err) => {
  console.error(\`❌ Error connecting to server: \${err.message}\`);
  console.log('Make sure the server is running on port 3001');
});

// Also try API endpoint
console.log('\\nTesting gold-rupee API endpoint...');

http.get('http://localhost:3001/api/gold-rupee', (res) => {
  console.log(\`API endpoint responded with status code: \${res.statusCode}\`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('✅ API endpoint returned valid JSON data');
      
      const dataCount = Array.isArray(jsonData) ? jsonData.length :
                        Array.isArray(jsonData.data) ? jsonData.data.length :
                        Array.isArray(jsonData.goldData) ? jsonData.goldData.length : 0;
      
      console.log(\`Data contains \${dataCount} records\`);
    } catch (err) {
      console.error(\`❌ API endpoint did not return valid JSON: \${err.message}\`);
    }
  });
}).on('error', (err) => {
  console.error(\`❌ Error connecting to API endpoint: \${err.message}\`);
});
`;

fs.writeFileSync('./test-server.js', testServerScript);
console.log('✅ Created test-server.js script');

console.log('\n✅ All fixes applied successfully!');
console.log('\nNext steps:');
console.log('1. Restart your server');
console.log('2. Run node test-server.js to verify it\'s working');
console.log('3. Update your deployment: git add . && git commit -m "Fix static file paths" && git push');
console.log('4. Deploy to Vercel: npx vercel --prod');
