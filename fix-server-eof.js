const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing "Unexpected end of input" error in server.js');

// Path to server.js
const serverPath = './server.js';

// Check if server.js exists
if (!fs.existsSync(serverPath)) {
  console.error('❌ server.js file not found!');
  process.exit(1);
}

// Create backup
const backupPath = `./server.js.backup-${Date.now()}`;
fs.copyFileSync(serverPath, backupPath);
console.log(`✅ Created backup of server.js at ${backupPath}`);

// Read the file
const content = fs.readFileSync(serverPath, 'utf8');

// Check for balanced delimiters
function checkBalance(text) {
  const stack = [];
  const pairs = {
    '{': '}',
    '(': ')',
    '[': ']'
  };
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplateString = false;
  let lastChar = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    // Skip characters in string literals
    if (char === "'" && !inDoubleQuote && !inTemplateString && lastChar !== '\\') {
      inSingleQuote = !inSingleQuote;
    } else if (char === '"' && !inSingleQuote && !inTemplateString && lastChar !== '\\') {
      inDoubleQuote = !inDoubleQuote;
    } else if (char === '`' && !inSingleQuote && !inDoubleQuote && lastChar !== '\\') {
      inTemplateString = !inTemplateString;
    } else if (!inSingleQuote && !inDoubleQuote && !inTemplateString) {
      // Process delimiters only when not in a string
      if (char in pairs) {
        stack.push({ char, position: i });
      } else if (Object.values(pairs).includes(char)) {
        const openChar = Object.keys(pairs).find(k => pairs[k] === char);
        if (stack.length === 0 || stack[stack.length - 1].char !== openChar) {
          return { balanced: false, error: `Unexpected closing delimiter '${char}' at position ${i}` };
        }
        stack.pop();
      }
    }
    
    lastChar = char;
  }
  
  if (stack.length > 0) {
    return {
      balanced: false,
      unclosedDelimiters: stack,
      error: `Unclosed delimiters: ${stack.map(item => `'${item.char}' at position ${item.position}`).join(', ')}`
    };
  }
  
  return { balanced: true };
}

// Check for balance
const balanceCheck = checkBalance(content);
console.log('\nChecking for balanced delimiters...');

if (balanceCheck.balanced) {
  console.log('✅ All delimiters are balanced. The issue might be something else.');
} else {
  console.log(`❌ Found unbalanced delimiters: ${balanceCheck.error}`);
  
  // Try to fix the missing delimiters if possible
  if (balanceCheck.unclosedDelimiters && balanceCheck.unclosedDelimiters.length > 0) {
    let fixedContent = content;
    
    // Add missing closing delimiters at the end
    const missingDelimiters = balanceCheck.unclosedDelimiters.map(item => {
      const pairs = {
        '{': '}',
        '(': ')',
        '[': ']'
      };
      return pairs[item.char];
    }).reverse().join('');
    
    fixedContent += `\n${missingDelimiters} // Auto-added by fix-server-eof.js`;
    
    // Save fixed content
    fs.writeFileSync(serverPath, fixedContent);
    console.log(`✅ Added missing closing delimiters: ${missingDelimiters}`);
  } else {
    console.log('❌ Could not automatically fix the unbalanced delimiters');
  }
}

// As a fallback, create a new clean server.js file
console.log('\nCreating a clean server.js file...');

const newServerContent = `// Basic Express server to serve static files and handle API routes
const express = require('express');
const path = require('path');
const fs = require('fs');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(\`[REQUEST] \${req.method} \${req.url}\`);
  next();
});

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

// Write the new server.js file
fs.writeFileSync(serverPath, newServerContent);
console.log('✅ Created a clean server.js file with proper syntax');

console.log('\nNext steps:');
console.log('1. Start the server: node server.js');
console.log('2. If you encounter issues, try running: node test-server.js');
console.log('3. Test the gold-rupee API endpoint: http://localhost:3001/api/gold-rupee');
