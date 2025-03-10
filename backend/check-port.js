const net = require('net');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Default port to check
const portToCheck = process.argv[2] || 3000;

// Check if a specific port is in use
async function checkPort(port) {
  console.log(`Checking if port ${port} is in use...`);

  // Try OS-specific commands first for more details
  try {
    if (process.platform === 'win32') {
      const { stdout } = await execPromise(`netstat -ano | findstr :${port}`);
      if (stdout.trim()) {
        console.log(`Port ${port} is in use by:`);
        console.log(stdout);
        
        // Get the PID using the port
        const pidMatch = stdout.match(/\s+(\d+)$/m);
        if (pidMatch && pidMatch[1]) {
          const pid = pidMatch[1];
          try {
            const { stdout: processInfo } = await execPromise(`tasklist /fi "pid eq ${pid}"`);
            console.log(`\nProcess details:`);
            console.log(processInfo);
          } catch (err) {
            console.log(`Could not get process details for PID ${pid}`);
          }
        }
        return true;
      }
    } else {
      // Unix/Linux/macOS
      const { stdout } = await execPromise(`lsof -i :${port} || netstat -tuln | grep ${port}`);
      if (stdout.trim()) {
        console.log(`Port ${port} is in use by:`);
        console.log(stdout);
        return true;
      }
    }
    
    console.log(`Port ${port} appears to be free based on system commands.`);
    return false;
  } catch (error) {
    // Command failed or returned no results, try Node.js socket check
    return new Promise((resolve) => {
      const server = net.createServer();
      
      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${port} is in use (confirmed by socket test).`);
          resolve(true);
        } else {
          console.error(`Error checking port: ${err.message}`);
          resolve(false);
        }
      });
      
      server.once('listening', () => {
        server.close();
        console.log(`Port ${port} is available.`);
        resolve(false);
      });
      
      server.listen(port);
    });
  }
}

// Find an available port starting from the given port
async function findAvailablePort(startPort) {
  console.log(`Looking for an available port starting from ${startPort}...`);
  
  let port = startPort;
  let isPortTaken = true;
  
  while (isPortTaken && port < startPort + 100) {
    isPortTaken = await checkPort(port);
    if (isPortTaken) {
      port++;
      console.log(`Trying port ${port}...`);
    } else {
      console.log(`\n✅ Port ${port} is available and can be used.`);
      return port;
    }
  }
  
  console.error(`Could not find an available port in range ${startPort} - ${startPort + 100}`);
  return null;
}

// Main function
async function main() {
  try {
    const isInUse = await checkPort(portToCheck);
    
    if (isInUse) {
      console.log(`\nPort ${portToCheck} is in use. Here are your options:`);
      console.log('1. Close the application using this port');
      
      if (process.platform === 'win32') {
        console.log('   Command: taskkill /F /PID <PID>');
      } else {
        console.log('   Command: kill -9 <PID>');
      }
      
      console.log('2. Use a different port for your application');
      console.log(`   In .env file: PORT=<new_port>`);
      console.log('3. Let me find an available port for you:');
      
      const availablePort = await findAvailablePort(Number(portToCheck) + 1);
      if (availablePort) {
        console.log(`\nYou can update your .env file with: PORT=${availablePort}`);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
