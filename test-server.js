// Test if server starts without syntax errors
const { spawn } = require('child_process');

console.log('🧪 Testing if server.js starts without syntax errors...');

const server = spawn('node', ['server.js']);
let errorDetected = false;

// Log output from the server
server.stdout.on('data', (data) => {
  console.log(`SERVER OUTPUT: ${data}`);
});

// Check for syntax errors
server.stderr.on('data', (data) => {
  console.error(`SERVER ERROR: ${data}`);
  if (data.toString().includes('SyntaxError')) {
    errorDetected = true;
    console.error('❌ Syntax error detected. Server failed to start.');
    process.exit(1);
  }
});

// Wait for a bit to see if the server starts successfully
setTimeout(() => {
  if (!errorDetected) {
    console.log('✅ Server started successfully! No syntax errors detected.');
    console.log('Stopping test server...');
    server.kill();
    process.exit(0);
  }
}, 3000);
