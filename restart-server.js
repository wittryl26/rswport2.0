const fs = require('fs');
const path = require('path');
const { exec, spawn, execSync } = require('child_process');

console.log('🔄 Server Restart Helper');
console.log('This script will help restart your server properly');

// Check if the server is running
function findServerProcess() {
  try {
    console.log('\n1️⃣ Checking for running server processes...');
    
    let processInfo;
    if (process.platform === 'win32') {
      // Windows
      processInfo = execSync('netstat -ano | findstr :3001').toString();
      console.log('Found processes on port 3001:');
      console.log(processInfo);
    } else {
      // Linux/Mac
      processInfo = execSync('lsof -i :3001').toString();
      console.log('Found processes on port 3001:');
      console.log(processInfo);
    }
    
    return processInfo.length > 0;
  } catch (err) {
    console.log('✅ No server process found running on port 3001');
    return false;
  }
}

// Kill the server process
function killServerProcess() {
  console.log('\n2️⃣ Attempting to kill any server processes on port 3001...');
  
  try {
    if (process.platform === 'win32') {
      // Windows - find PID first
      const processInfo = execSync('netstat -ano | findstr :3001').toString();
      const lines = processInfo.split('\n');
      
      if (lines.length > 0) {
        // Extract PID - typically the last column
        for (const line of lines) {
          if (line.includes('LISTENING')) {
            const pid = line.trim().split(/\s+/).pop();
            if (pid && !isNaN(parseInt(pid))) {
              console.log(`Found server process with PID: ${pid}`);
              execSync(`taskkill /F /PID ${pid}`);
              console.log(`✅ Successfully killed process ${pid}`);
            }
          }
        }
      }
    } else {
      // Linux/Mac
      execSync('pkill -f "node.*server\\.js"');
      console.log('✅ Killed processes running server.js');
    }
  } catch (err) {
    console.log('No server processes found or error killing process:', err.message);
  }
}

// Find server.js file
function findServerFile() {
  console.log('\n3️⃣ Looking for server.js file...');
  
  const possiblePaths = [
    './server.js',
    './backend/server.js', 
    './api/server.js'
  ];
  
  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      console.log(`✅ Found server file at ${filePath}`);
      return filePath;
    }
  }
  
  console.error('❌ Could not find server.js file!');
  return null;
}

// Check package.json for start script
function checkPackageJson() {
  console.log('\n4️⃣ Checking package.json for start script...');
  
  const packageJsonPaths = [
    './package.json',
    './backend/package.json'
  ];
  
  for (const packagePath of packageJsonPaths) {
    if (fs.existsSync(packagePath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        console.log(`Found package.json at ${packagePath}`);
        
        if (packageJson.scripts && packageJson.scripts.start) {
          console.log(`✅ Found start script: "${packageJson.scripts.start}"`);
          return { path: packagePath, script: packageJson.scripts.start };
        } else {
          console.log('⚠️ No start script found in package.json');
          
          // Look for other scripts that might start the server
          if (packageJson.scripts) {
            const serverScripts = Object.entries(packageJson.scripts)
              .filter(([name, cmd]) => 
                cmd.includes('server') || 
                cmd.includes('start') || 
                name.includes('server') ||
                name.includes('dev')
              );
            
            if (serverScripts.length > 0) {
              console.log('Found potential server scripts:');
              serverScripts.forEach(([name, cmd]) => {
                console.log(`  - ${name}: ${cmd}`);
              });
              
              return { path: packagePath, script: serverScripts[0][1], scriptName: serverScripts[0][0] };
            }
          }
        }
      } catch (err) {
        console.error(`Error parsing ${packagePath}:`, err.message);
      }
    }
  }
  
  return null;
}

// Start the server
function startServer() {
  console.log('\n5️⃣ Starting server...');
  
  // Strategy 1: Check package.json first
  const packageInfo = checkPackageJson();
  if (packageInfo) {
    const packageDir = path.dirname(packageInfo.path);
    
    if (packageInfo.scriptName) {
      console.log(`Starting server using "npm run ${packageInfo.scriptName}" in ${packageDir}`);
      
      const serverProcess = spawn('npm', ['run', packageInfo.scriptName], {
        cwd: packageDir,
        shell: true,
        stdio: 'inherit'
      });
      
      serverProcess.on('error', (err) => {
        console.error('Failed to start server:', err.message);
      });
      
      return;
    } else {
      console.log(`Starting server using "npm start" in ${packageDir}`);
      
      const serverProcess = spawn('npm', ['start'], {
        cwd: packageDir,
        shell: true,
        stdio: 'inherit'
      });
      
      serverProcess.on('error', (err) => {
        console.error('Failed to start server with npm start:', err.message);
      });
      
      return;
    }
  }
  
  // Strategy 2: Run server.js directly with node
  const serverFile = findServerFile();
  if (serverFile) {
    console.log(`Starting server by running node ${serverFile}`);
    
    const serverProcess = spawn('node', [serverFile], {
      shell: true,
      stdio: 'inherit'
    });
    
    serverProcess.on('error', (err) => {
      console.error('Failed to start server:', err.message);
    });
    
    return;
  }
  
  console.error('❌ Could not find a way to start the server');
  console.log('\nTry running one of these commands manually:');
  console.log('1. node server.js');
  console.log('2. node backend/server.js');
  console.log('3. npm start (in the project root or backend directory)');
}

// Execute the server restart process
const isServerRunning = findServerProcess();
if (isServerRunning) {
  killServerProcess();
}
startServer();

console.log('\n✅ Attempted to restart the server');
console.log('\nIf the server didn\'t restart properly, try:');
console.log('1. Finding and killing the Node.js process manually in Task Manager');
console.log('2. Running the server directly with: node server.js');
console.log('3. Checking server.js for any errors');
