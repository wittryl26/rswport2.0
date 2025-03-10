const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { findAvailablePort } = require('./utils/port-finder');

// PID file for tracking the running server
const PID_FILE = path.join(__dirname, '.server.pid');

/**
 * Start the server with automatic port selection
 */
async function startServer() {
  try {
    // Check if server is already running
    if (fs.existsSync(PID_FILE)) {
      const pid = fs.readFileSync(PID_FILE, 'utf8');
      console.log(`Server appears to be running with PID ${pid}`);
      console.log('Use "node server-manager.js restart" to restart the server');
      return;
    }
    
    // Find an available port
    const port = await findAvailablePort(3000);
    if (port !== 3000) {
      console.log(`Port 3000 is in use. Using port ${port} instead.`);
    }
    
    // Set environment variable for port
    const env = { ...process.env, PORT: port.toString() };
    
    // Start the server
    const server = spawn('node', ['server.js'], { 
      env,
      detached: false,
      stdio: 'inherit'
    });
    
    // Store PID for later use
    fs.writeFileSync(PID_FILE, server.pid.toString());
    
    console.log(`Server started on port ${port} with PID ${server.pid}`);
    console.log(`API available at http://localhost:${port}/api-docs`);
    
    // Clean up PID file if server exits
    server.on('exit', () => {
      if (fs.existsSync(PID_FILE)) {
        fs.unlinkSync(PID_FILE);
      }
    });
  } catch (error) {
    console.error(`Error starting server: ${error.message}`);
  }
}

/**
 * Stop the server if it's running
 */
function stopServer() {
  try {
    if (!fs.existsSync(PID_FILE)) {
      console.log('No running server found');
      return;
    }
    
    const pid = fs.readFileSync(PID_FILE, 'utf8');
    
    // Kill the process (platform-specific)
    if (process.platform === 'win32') {
      exec(`taskkill /pid ${pid} /f /t`, (error) => {
        if (error) {
          console.error(`Error stopping server: ${error.message}`);
        } else {
          console.log(`Server with PID ${pid} stopped successfully`);
          fs.unlinkSync(PID_FILE);
        }
      });
    } else {
      // Unix-based systems
      process.kill(pid, 'SIGTERM');
      console.log(`Server with PID ${pid} stopped successfully`);
      fs.unlinkSync(PID_FILE);
    }
  } catch (error) {
    console.error(`Error stopping server: ${error.message}`);
    
    // Clean up PID file if it exists
    if (fs.existsSync(PID_FILE)) {
      fs.unlinkSync(PID_FILE);
    }
  }
}

/**
 * Restart the server
 */
async function restartServer() {
  stopServer();
  
  // Give time for server to stop
  setTimeout(() => {
    startServer();
  }, 2000);
}

// Parse command line arguments
const command = process.argv[2] || 'start';

switch (command) {
  case 'start':
    startServer();
    break;
  case 'stop':
    stopServer();
    break;
  case 'restart':
    restartServer();
    break;
  default:
    console.log('Unknown command. Use: start, stop, or restart');
}
