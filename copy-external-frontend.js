const fs = require('fs');
const path = require('path');

console.log('🔄 Copying content from external Frontend directory to newfrontend');

// Source and destination paths
const SOURCE_PATH = 'C:/rswportfolio/Frontend';
const DEST_PATH = './newfrontend';

// Check if source Frontend directory exists
if (!fs.existsSync(SOURCE_PATH)) {
  console.error(`❌ External Frontend directory not found at ${SOURCE_PATH}`);
  process.exit(1);
}

// Create newfrontend directory if it doesn't exist
if (!fs.existsSync(DEST_PATH)) {
  console.log(`Creating ${DEST_PATH} directory...`);
  fs.mkdirSync(DEST_PATH, { recursive: true });
}

console.log(`\n1️⃣ Copying content from ${SOURCE_PATH} to ${DEST_PATH}...`);

// Function to copy directory recursively
function copyDirectory(source, destination) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
    console.log(`Created directory: ${destination}`);
  }

  // Get all files and directories in the source
  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);

    // Skip .git directories and node_modules
    if (entry.name === '.git' || entry.name === 'node_modules') {
      continue;
    }

    try {
      if (entry.isDirectory()) {
        // Recursively copy directories
        copyDirectory(sourcePath, destPath);
      } else {
        // Copy files
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied: ${entry.name}`);
      }
    } catch (err) {
      console.error(`Error copying ${sourcePath}: ${err.message}`);
    }
  }
}

// Copy all files from external Frontend to newfrontend
try {
  copyDirectory(SOURCE_PATH, DEST_PATH);
  console.log(`\n✅ Successfully copied files from ${SOURCE_PATH} to ${DEST_PATH}`);
} catch (err) {
  console.error(`\n❌ Error during copying: ${err.message}`);
  process.exit(1);
}

console.log('\n2️⃣ Ensuring vercel.json is configured correctly...');

// Ensure vercel.json is correct
let vercelConfig;
try {
  vercelConfig = JSON.parse(fs.readFileSync('./vercel.json', 'utf8'));
  let vercelUpdated = false;
  
  // Check outputDirectory
  if (vercelConfig.outputDirectory !== 'newfrontend') {
    vercelConfig.outputDirectory = 'newfrontend';
    vercelUpdated = true;
    console.log('Updated outputDirectory to newfrontend');
  }
  
  // Check routes
  if (vercelConfig.routes) {
    for (let i = 0; i < vercelConfig.routes.length; i++) {
      const route = vercelConfig.routes[i];
      
      // Fix any reference to Frontend in routes
      if (route.dest && route.dest.includes('Frontend')) {
        vercelConfig.routes[i].dest = route.dest.replace(/Frontend/g, 'newfrontend');
        vercelUpdated = true;
        console.log(`Updated route dest: ${route.dest} -> ${vercelConfig.routes[i].dest}`);
      }
    }
  }
  
  // Check builds
  if (vercelConfig.builds) {
    for (let i = 0; i < vercelConfig.builds.length; i++) {
      const build = vercelConfig.builds[i];
      
      // Fix any reference to Frontend in builds
      if (build.src && build.src.includes('Frontend')) {
        vercelConfig.builds[i].src = build.src.replace(/Frontend/g, 'newfrontend');
        vercelUpdated = true;
        console.log(`Updated build src: ${build.src} -> ${vercelConfig.builds[i].src}`);
      }
    }
  }
  
  // Save updated vercel.json if needed
  if (vercelUpdated) {
    fs.writeFileSync('./vercel.json', JSON.stringify(vercelConfig, null, 2));
    console.log('✅ Saved updated vercel.json configuration');
  } else {
    console.log('✅ vercel.json configuration is correct');
  }
} catch (err) {
  console.error(`❌ Error checking vercel.json: ${err.message}`);
}

// Create debug.html file in newfrontend
console.log('\n3️⃣ Creating debug.html in newfrontend directory...');
const debugHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Debug - Vercel Deployment</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; }
    .container { max-width: 800px; margin: 0 auto; background: #f5f5f5; padding: 20px; border-radius: 8px; }
    h1 { color: #2c3e50; }
    .status { margin: 20px 0; padding: 15px; border-radius: 4px; }
    .success { background-color: #dff2bf; color: #4f8a10; }
    .error { background-color: #ffbaba; color: #d8000c; }
    pre { background: #333; color: #fff; padding: 10px; border-radius: 4px; overflow-x: auto; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Deployment Debug Page</h1>
    
    <div class="status success">
      <p>✅ If you can see this page, files are being served correctly from the newfrontend directory!</p>
    </div>
    
    <h2>Current Path:</h2>
    <pre id="current-path"></pre>
    
    <div id="file-list" class="status">
      <h3>Files successfully copied:</h3>
      <p>Files from C:/rswportfolio/Frontend have been copied to newfrontend.</p>
    </div>
    
    <h2>API Test:</h2>
    <div id="api-result" class="status">Testing API connection...</div>
  </div>
  
  <script>
    // Show current path
    document.getElementById('current-path').textContent = window.location.href;
    
    // Test API endpoint
    fetch('/api/health')
      .then(response => response.json())
      .then(data => {
        const div = document.getElementById('api-result');
        div.className = 'status success';
        div.innerHTML = '<p>✅ API endpoint /api/health is working!</p><pre>' + JSON.stringify(data, null, 2) + '</pre>';
      })
      .catch(err => {
        const div = document.getElementById('api-result');
        div.className = 'status error';
        div.innerHTML = '<p>❌ API endpoint /api/health is not responding:</p><pre>' + err.message + '</pre>';
      });
  </script>
</body>
</html>`;

try {
  fs.writeFileSync(path.join(DEST_PATH, 'debug.html'), debugHtml);
  console.log('✅ Created debug.html in newfrontend directory');
} catch (err) {
  console.error(`❌ Error creating debug.html: ${err.message}`);
}

console.log('\n✅ Content copy complete!');
console.log('\nNext steps:');
console.log('1. Add the changes to Git: git add .');
console.log('2. Commit the changes: git commit -m "Copy content from external Frontend to newfrontend"');
console.log('3. Push to GitHub: git push');
console.log('4. Deploy to Vercel: npx vercel --prod');
console.log('\nAfter deployment, check your site and verify it loads correctly.');
