const net = require('net');

/**
 * Checks if a port is available
 * @param {number} port The port to check
 * @returns {Promise<boolean>} True if the port is available, false otherwise
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', () => {
      // Port is in use
      resolve(false);
    });
    
    server.once('listening', () => {
      // Port is available
      server.close();
      resolve(true);
    });
    
    server.listen(port);
  });
}

// Function to check if a port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    
    server.listen(port);
  });
}

/**
 * Finds an available port starting from the preferred port
 * @param {number} preferredPort The port to start checking from
 * @param {number} maxAttempts Maximum number of ports to check
 * @returns {Promise<number>} An available port
 */
async function findAvailablePort(preferredPort = 3000, maxAttempts = 10) {
  for (let port = preferredPort; port < preferredPort + maxAttempts; port++) {
    const available = await isPortAvailable(port);
    if (available) {
      return port;
    }
  }
  
  // If all fails, return the original preferred port
  // It might fail when used, but at least we tried
  console.warn(`Could not find available port after ${maxAttempts} attempts. Using default: ${preferredPort}`);
  return preferredPort;
}

// Find an available port starting from the base port
async function findAvailablePort(basePort) {
  let port = basePort;
  
  while (await isPortInUse(port)) {
    console.log(`Port ${port} is in use, trying ${port + 1}`);
    port++;
    
    // Safety limit to prevent infinite loop
    if (port > basePort + 100) {
      throw new Error('Could not find an available port within reasonable range');
    }
  }
  
  return port;
}

module.exports = { isPortAvailable, isPortInUse, findAvailablePort };
