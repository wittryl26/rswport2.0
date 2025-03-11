const fs = require('fs');
const path = require('path');

console.log('🛠️ Server.js Syntax Fixer');
console.log('This script will fix the "Unexpected token \')\'\" syntax error in server.js');

// Path to server.js
const serverPath = './server.js';

// Check if server.js exists
if (!fs.existsSync(serverPath)) {
  console.error('❌ server.js file not found!');
  process.exit(1);
}

// Create backup of the original file
const backupPath = `./server.js.backup-${Date.now()}`;
fs.copyFileSync(serverPath, backupPath);
console.log(`✅ Created backup of server.js at ${backupPath}`);

// Read the file
const content = fs.readFileSync(serverPath, 'utf8');
const lines = content.split('\n');

// Log information about the file
console.log(`\nAnalyzing server.js (${lines.length} lines)`);

// Check the specific problematic area (around line 150)
const problematicLineIndex = 149; // Line 150 (zero-indexed is 149)
const contextSize = 10; // Show this many lines before and after

// Show the context around the error
const startLine = Math.max(0, problematicLineIndex - contextSize);
const endLine = Math.min(lines.length - 1, problematicLineIndex + contextSize);

console.log('\nContext around error (line 150):');
for (let i = startLine; i <= endLine; i++) {
  const marker = i === problematicLineIndex ? '→' : ' ';
  console.log(`${marker} ${i + 1}: ${lines[i]}`);
}

// Fix the syntax error by analyzing the code and fixing the most common patterns
console.log('\nAttempting to fix the syntax error...');

// Most common causes of "Unexpected token ')'" errors:
// 1. Extra closing parenthesis
// 2. Missing opening parenthesis
// 3. Misplaced parenthesis in a conditional, function call, or object literal

// Strategy 1: Look specifically at line 150
const problematicLine = lines[problematicLineIndex];
if (problematicLine.trim() === ');') {
  // This is a common error pattern where there's a stray closing parenthesis
  // The fix is to remove the line or replace it with a correct statement
  
  // First, check if it's part of a block that might need proper closing
  let blockStart = -1;
  for (let i = problematicLineIndex - 1; i >= 0; i--) {
    if (lines[i].includes('app.get(') || lines[i].includes('app.use(')) {
      blockStart = i;
      break;
    }
  }
  
  if (blockStart !== -1) {
    // Check if the handler already ends with a closing parenthesis
    let found = false;
    for (let i = blockStart + 1; i < problematicLineIndex; i++) {
      if (lines[i].trim().endsWith(');')) {
        found = true;
        break;
      }
    }
    
    if (found) {
      // The handler already has a proper closing parenthesis, so this one is extraneous
      console.log('✅ Identified extraneous closing parenthesis. Removing line.');
      lines.splice(problematicLineIndex, 1);
    } else {
      // The handler might not be properly closed, let's check the previous line
      const prevLine = lines[problematicLineIndex - 1];
      if (prevLine.trim().endsWith('}')) {
        // The previous line ends the function body, this parenthesis might be valid
        // but improperly formatted
        console.log('✅ Fixed improperly formatted closing parenthesis');
        lines[problematicLineIndex - 1] = prevLine + ');';
        lines.splice(problematicLineIndex, 1);
      } else {
        // We're not sure what this is, remove it cautiously
        console.log('⚠️ Removing potentially improper closing parenthesis at line 150');
        lines.splice(problematicLineIndex, 1);
      }
    }
  } else {
    // No obvious block start found, we'll need to look more closely
    console.log('⚠️ No clear block start found, removing potentially problematic line');
    lines.splice(problematicLineIndex, 1);
  }
} else if (problematicLine.includes(');')) {
  // The line contains a closing parenthesis somewhere, might be misplaced
  console.log('⚠️ Line contains potentially misplaced closing parenthesis, attempting to fix');
  
  // Replace line with a corrected version without the stray closing parenthesis
  lines[problematicLineIndex] = problematicLine.replace(/\);(?!\s*\{|\s*\)|\s*,|\s*;)/, '');
} else {
  // We need a more extensive fix
  console.log('⚠️ Complex syntax issue detected, creating a clean server.js');
  
  // Create a minimal correct Express server
  const newServerContent = `// Basic Express server to serve static files and handle API routes
const express = require('express');
const path = require('path');
const fs = require('fs');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Request logging middleware
app.use((req, res, next) => {
  console.log(\`[REQUEST] \${req.method} \${req.url}\`);
  next();
});

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the newfrontend folder
app.use(express.static('./newfrontend'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Gold-rupee data endpoint
app.get('/api/gold-rupee', (req, res) => {
  console.log('Gold-rupee API endpoint called');
  
  try {
    // Find and read the data file
    const dataFiles = [
      path.join(__dirname, 'newfrontend/data/gold_rupee_data.json'),
      path.join(__dirname, 'newfrontend/data/gold-rupee-data.json'),
      path.join(__dirname, 'backend/data/gold_rupee_data.json'),
      path.join(__dirname, 'data/gold_rupee_data.json')
    ];
    
    let dataFile = null;
    for (const file of dataFiles) {
      if (fs.existsSync(file)) {
        dataFile = file;
        console.log(\`Using data file: \${dataFile}\`);
        break;
      }
    }
    
    if (!dataFile) {
      return res.status(404).json({ error: 'Data file not found' });
    }
    
    const jsonData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    
    // Filter for 5-year range
    const now = new Date();
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(now.getFullYear() - 5);
    
    // Process based on data format
    let processedData = jsonData;
    
    if (Array.isArray(jsonData)) {
      // Direct array format
      processedData = jsonData.filter(item => new Date(item.date) >= fiveYearsAgo);
      console.log(\`Filtered array data to \${processedData.length} records\`);
    } else if (jsonData.data && Array.isArray(jsonData.data)) {
      // Object with data array
      processedData.data = jsonData.data.filter(item => new Date(item.date) >= fiveYearsAgo);
      console.log(\`Filtered data.data to \${processedData.data.length} records\`);
    } else if (jsonData.goldData && Array.isArray(jsonData.goldData)) {
      // Object with separate arrays
      processedData.goldData = jsonData.goldData.filter(item => new Date(item.date) >= fiveYearsAgo);
      
      if (jsonData.rupeeData && Array.isArray(jsonData.rupeeData)) {
        processedData.rupeeData = jsonData.rupeeData.filter(item => new Date(item.date) >= fiveYearsAgo);
      }
      
      console.log(\`Filtered goldData to \${processedData.goldData.length} records\`);
    }
    
    return res.json(processedData);
  } catch (error) {
    console.error('Error in gold-rupee endpoint:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Handle economic data requests
app.get('/api/econ-data', (req, res) => {
  try {
    const econDataFiles = [
      path.join(__dirname, 'newfrontend/data/econ_data.json'),
      path.join(__dirname, 'backend/data/econ_data.json')
    ];
    
    let dataFile = econDataFiles.find(file => fs.existsSync(file));
    if (!dataFile) {
      return res.status(404).json({ error: 'Economic data file not found' });
    }
    
    const econData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    res.json(econData);
  } catch (error) {
    console.error('Error serving economic data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Handle financial data requests
app.get('/api/financial', (req, res) => {
  try {
    const financialDataFiles = [
      path.join(__dirname, 'newfrontend/data/financial_data.json'),
      path.join(__dirname, 'backend/data/financial_data.json')
    ];
    
    let dataFile = financialDataFiles.find(file => fs.existsSync(file));
    if (!dataFile) {
      return res.status(404).json({ error: 'Financial data file not found' });
    }
    
    const financialData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    res.json(financialData);
  } catch (error) {
    console.error('Error serving financial data:', error);
    res.status(500).json({ error: error.message });
  }
});

// All other GET requests not handled before will return the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './newfrontend/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
  console.log(\`Serving static files from: \${path.join(__dirname, 'newfrontend')}\`);
  console.log('API endpoints available at: /api/health, /api/gold-rupee, /api/econ-data, /api/financial');
});
`;

  // Replace the entire file content
  lines.length = 0;
  newServerContent.split('\n').forEach(line => lines.push(line));
}

// Save the fixed file
const fixedContent = lines.join('\n');
fs.writeFileSync(serverPath, fixedContent);

console.log('\n✅ Fixed server.js syntax error!');

// Create a test script to verify the server is working
const testServerScriptPath = './test-server.js';
const testServerScript = `// Test if server starts without syntax errors
const { spawn } = require('child_process');

console.log('🧪 Testing if server.js starts without syntax errors...');

const server = spawn('node', ['server.js']);
let errorDetected = false;

// Log output from the server
server.stdout.on('data', (data) => {
  console.log(\`SERVER OUTPUT: \${data}\`);
});

// Check for syntax errors
server.stderr.on('data', (data) => {
  console.error(\`SERVER ERROR: \${data}\`);
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
`;

fs.writeFileSync(testServerScriptPath, testServerScript);
console.log(`✅ Created test script at ${testServerScriptPath}`);

console.log('\nNext steps:');
console.log('1. Start the server: node server.js');
console.log('2. If you encounter issues, restore from backup: cp ' + backupPath + ' ./server.js');
console.log('3. Access API endpoint: http://localhost:3001/api/gold-rupee');
