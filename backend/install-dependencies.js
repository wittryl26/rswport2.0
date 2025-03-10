const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to run a command and log output
function runCommand(command, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} in ${cwd}`);
    
    const child = exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return reject(error);
      }
      
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      
      console.log(`stdout: ${stdout}`);
      resolve(stdout);
    });

    // Stream output in real-time
    child.stdout.on('data', (data) => {
      process.stdout.write(data);
    });

    child.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}

// Main installation function
async function installDependencies() {
  try {
    console.log('Starting installation of dependencies...');
    console.log('----------------------------------------');
    
    // Check if package.json exists
    const packagePath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packagePath)) {
      console.error('Error: package.json not found. Make sure you are in the correct directory.');
      process.exit(1);
    }
    
    // Install dependencies
    console.log('Installing dependencies...');
    await runCommand('npm install');
    
    console.log('----------------------------------------');
    console.log('✅ Installation completed successfully!');
    console.log('----------------------------------------');
    console.log('You can now start the server with: npm start');
    console.log('Or run in development mode with: npm run dev');
    
  } catch (error) {
    console.error('Installation failed:', error);
    process.exit(1);
  }
}

// Run the installation
installDependencies();
