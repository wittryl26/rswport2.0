const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing all "Frontend" directory references...');

// 1. First check the vercel.json file which is the most important
console.log('\n1️⃣ Checking vercel.json configuration...');
let vercelConfig;
try {
  vercelConfig = JSON.parse(fs.readFileSync('./vercel.json', 'utf8'));
  console.log(`Current outputDirectory: ${vercelConfig.outputDirectory}`);
  
  // Check if there are any "Frontend" references in vercel.json
  const vercelJson = JSON.stringify(vercelConfig);
  if (vercelJson.includes('Frontend')) {
    console.log('⚠️ Found "Frontend" references in vercel.json!');
    
    // Update outputDirectory if needed
    if (vercelConfig.outputDirectory === 'Frontend') {
      vercelConfig.outputDirectory = 'newfrontend';
      console.log('✅ Updated outputDirectory to "newfrontend"');
    }
    
    // Update routes
    if (vercelConfig.routes && Array.isArray(vercelConfig.routes)) {
      vercelConfig.routes.forEach((route, index) => {
        if (route.dest && route.dest.includes('Frontend')) {
          vercelConfig.routes[index].dest = route.dest.replace(/Frontend/g, 'newfrontend');
          console.log(`✅ Updated route: ${route.src} → ${vercelConfig.routes[index].dest}`);
        }
      });
    }
    
    // Update builds
    if (vercelConfig.builds && Array.isArray(vercelConfig.builds)) {
      vercelConfig.builds.forEach((build, index) => {
        if (build.src && build.src.includes('Frontend')) {
          vercelConfig.builds[index].src = build.src.replace(/Frontend/g, 'newfrontend');
          console.log(`✅ Updated build source: ${vercelConfig.builds[index].src}`);
        }
      });
    }
    
    // Write updated vercel.json
    fs.writeFileSync('./vercel.json', JSON.stringify(vercelConfig, null, 2));
    console.log('✅ Updated vercel.json saved');
  } else {
    console.log('✅ vercel.json does not contain any "Frontend" references');
  }
} catch (err) {
  console.error(`❌ Error processing vercel.json: ${err.message}`);
}

// 2. Add a redirect route to handle any leftover Frontend URLs
console.log('\n2️⃣ Adding a redirect for any lingering Frontend URLs...');
try {
  // Make sure we have valid vercel.json data
  if (vercelConfig && vercelConfig.routes && Array.isArray(vercelConfig.routes)) {
    // Check if we already have a redirect rule
    const hasRedirect = vercelConfig.routes.some(route => 
      route.src && route.src.includes('Frontend') && route.status === 301
    );
    
    if (!hasRedirect) {
      // Add a redirect from /Frontend/* to /*
      vercelConfig.routes.unshift({
        "src": "/Frontend/(.*)",
        "status": 301,
        "headers": {
          "Location": "/$1"
        }
      });
      
      console.log('✅ Added redirect rule: /Frontend/* → /*');
      
      // Write updated vercel.json
      fs.writeFileSync('./vercel.json', JSON.stringify(vercelConfig, null, 2));
      console.log('✅ Updated vercel.json with redirect rule');
    } else {
      console.log('✅ Redirect rule already exists');
    }
  }
} catch (err) {
  console.error(`❌ Error adding redirect rule: ${err.message}`);
}

// 3. Check for references in server.js files
console.log('\n3️⃣ Checking server files for hardcoded Frontend references...');
const serverFiles = [
  './server.js',
  './backend/server.js'
];

serverFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('Frontend')) {
        console.log(`⚠️ Found "Frontend" references in ${file}`);
        
        // Replace Frontend with newfrontend
        const updatedContent = content.replace(/Frontend/g, 'newfrontend');
        fs.writeFileSync(file, updatedContent);
        console.log(`✅ Updated ${file}`);
      } else {
        console.log(`✅ No "Frontend" references in ${file}`);
      }
    } catch (err) {
      console.error(`❌ Error checking ${file}: ${err.message}`);
    }
  }
});

// 4. Check for Frontend directory existence
console.log('\n4️⃣ Checking if Frontend directory exists...');
if (fs.existsSync('./Frontend')) {
  console.log('⚠️ Frontend directory still exists!');
  console.log('This could be causing the confusion. Should we:');
  console.log('  1. Rename Frontend to newfrontend-backup');
  console.log('  2. Create a symlink Frontend → newfrontend');
  
  // Rename Frontend directory
  try {
    fs.renameSync('./Frontend', './Frontend-backup');
    console.log('✅ Renamed Frontend to Frontend-backup');
  } catch (err) {
    console.error(`❌ Error renaming Frontend directory: ${err.message}`);
  }
} else {
  console.log('✅ No Frontend directory exists (good!)');
}

// 5. Ensure the index.html file exists in newfrontend
console.log('\n5️⃣ Checking for index.html in newfrontend directory...');
if (!fs.existsSync('./newfrontend')) {
  console.log('⚠️ newfrontend directory does not exist!');
  fs.mkdirSync('./newfrontend', { recursive: true });
  console.log('✅ Created newfrontend directory');
}

if (!fs.existsSync('./newfrontend/index.html')) {
  console.log('⚠️ No index.html found in newfrontend directory!');
  
  // Check if there's an index.html in the root directory
  if (fs.existsSync('./index.html')) {
    // Copy index.html from root to newfrontend
    fs.copyFileSync('./index.html', './newfrontend/index.html');
    console.log('✅ Copied index.html from root to newfrontend directory');
  } else {
    // Create a basic index.html
    const basicHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ryland Wittman Portfolio</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { color: #2c3e50; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Ryland Wittman Portfolio</h1>
    <p>Welcome to my portfolio site.</p>
    
    <p id="api-status">Checking API connection...</p>
  </div>

  <script>
    // Check if API is working
    fetch('/api/health')
      .then(response => response.json())
      .then(data => {
        document.getElementById('api-status').innerHTML = 'API connection: ✅ Connected';
        console.log('API data:', data);
      })
      .catch(err => {
        document.getElementById('api-status').innerHTML = 'API connection: ❌ Error - ' + err.message;
        console.error('API connection error:', err);
      });
  </script>
</body>
</html>`;
    
    fs.writeFileSync('./newfrontend/index.html', basicHtml);
    console.log('✅ Created basic index.html in newfrontend directory');
  }
}

// 6. Create a debug.html file in newfrontend
console.log('\n6️⃣ Creating debug.html in newfrontend directory...');
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
      <p>✅ If you can see this page, <strong>newfrontend/debug.html</strong> is being served correctly!</p>
    </div>
    
    <h2>Current Path:</h2>
    <pre id="current-path"></pre>
    
    <h2>Environment:</h2>
    <pre id="user-agent"></pre>
    
    <h2>API Test:</h2>
    <div id="api-result" class="status">Testing API connection...</div>

    <h2>Directory Structure:</h2>
    <p>The deployment is configured to use the <strong>newfrontend</strong> directory for static files.</p>
    <p>Any lingering references to <strong>Frontend</strong> directory will be redirected.</p>
  </div>
  
  <script>
    // Show current path
    document.getElementById('current-path').textContent = window.location.href;
    
    // Show user agent
    document.getElementById('user-agent').textContent = navigator.userAgent;
    
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

fs.writeFileSync('./newfrontend/debug.html', debugHtml);
console.log('✅ Created debug.html in newfrontend directory');

// 7. Update environment variables
console.log('\n7️⃣ Updating environment variables...');
const envFiles = ['./.env', './.env.vercel', './backend/.env'];

envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      let content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('Frontend')) {
        content = content.replace(/Frontend/g, 'newfrontend');
        fs.writeFileSync(file, content);
        console.log(`✅ Updated ${file}`);
      } else {
        console.log(`✅ No "Frontend" references in ${file}`);
      }
    } catch (err) {
      console.error(`❌ Error updating ${file}: ${err.message}`);
    }
  }
});

// 8. Check package.json files
console.log('\n8️⃣ Checking package.json files...');
const packageFiles = ['./package.json', './backend/package.json'];

packageFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(file, 'utf8'));
      let updated = false;
      
      // Check scripts
      if (packageJson.scripts) {
        Object.keys(packageJson.scripts).forEach(script => {
          if (packageJson.scripts[script].includes('Frontend')) {
            packageJson.scripts[script] = packageJson.scripts[script].replace(/Frontend/g, 'newfrontend');
            updated = true;
          }
        });
      }
      
      if (updated) {
        fs.writeFileSync(file, JSON.stringify(packageJson, null, 2));
        console.log(`✅ Updated ${file}`);
      } else {
        console.log(`✅ No "Frontend" references in ${file}`);
      }
    } catch (err) {
      console.error(`❌ Error updating ${file}: ${err.message}`);
    }
  }
});

console.log('\n✅ All fixes applied! Follow these steps to deploy:');
console.log('1. Commit the changes:');
console.log('   git add .');
console.log('   git commit -m "Fix all Frontend references to newfrontend"');
console.log('   git push');
console.log('\n2. Deploy to Vercel:');
console.log('   npx vercel --prod');
console.log('\nAfter deploying, your site should load correctly at the root URL.');
