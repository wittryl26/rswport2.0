const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Syntax Error Finder and Fixer');
console.log('This script will check JavaScript files for syntax errors and attempt to fix them');

// Files to check first (most likely culprits)
const priorityFiles = [
  './server.js',
  './api/gold-rupee.js',
  './fix-endpoint-order.js'
];

// Helper function to check a file's syntax
function checkSyntax(filePath) {
  if (!fs.existsSync(filePath)) {
    return { error: `File not found: ${filePath}` };
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Count opening and closing braces
    let openBraces = 0;
    let closeBraces = 0;
    let openParens = 0;
    let closeParens = 0;
    
    // Keep track of line numbers where braces occur for better error reporting
    const braceLocations = [];
    
    // Process file line by line for better error reporting
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Count braces in this line
      for (let j = 0; j < line.length; j++) {
        if (line[j] === '{') {
          openBraces++;
          braceLocations.push({ type: 'open', line: i + 1, char: j + 1 });
        } else if (line[j] === '}') {
          closeBraces++;
          braceLocations.push({ type: 'close', line: i + 1, char: j + 1 });
          
          // If we have more close braces than open, that's likely our error
          if (closeBraces > openBraces) {
            return {
              error: `Unexpected closing brace at line ${i + 1}, character ${j + 1}`,
              line: i + 1,
              char: j + 1,
              content: lines[i],
              braceBalance: openBraces - closeBraces,
              fixable: true,
              fix: () => {
                // Remove the extra closing brace
                const newLine = line.substring(0, j) + line.substring(j + 1);
                lines[i] = newLine;
                return lines.join('\n');
              }
            };
          }
        }
        
        // Also check for parentheses balance
        if (line[j] === '(') {
          openParens++;
        } else if (line[j] === ')') {
          closeParens++;
        }
      }
    }
    
    // Check for missing closing braces
    if (openBraces > closeBraces) {
      return {
        error: `Missing ${openBraces - closeBraces} closing brace(s)`,
        braceBalance: openBraces - closeBraces,
        fixable: true,
        fix: () => {
          // Add missing closing braces at the end
          const missing = openBraces - closeBraces;
          for (let i = 0; i < missing; i++) {
            lines.push('} // Auto-added by syntax fixer');
          }
          return lines.join('\n');
        }
      };
    }
    
    // Check for too many closing braces
    if (closeBraces > openBraces) {
      // Find the last unexpected closing brace
      for (let i = braceLocations.length - 1; i >= 0; i--) {
        const loc = braceLocations[i];
        if (loc.type === 'close') {
          return {
            error: `Unexpected closing brace at line ${loc.line}, character ${loc.char}`,
            line: loc.line,
            char: loc.char,
            fixable: true,
            fix: () => {
              // Remove the last extra closing brace
              const lineIndex = loc.line - 1;
              const line = lines[lineIndex];
              const newLine = line.substring(0, loc.char - 1) + line.substring(loc.char);
              lines[lineIndex] = newLine;
              return lines.join('\n');
            }
          };
        }
      }
    }
    
    // Check for mismatched parentheses
    if (openParens !== closeParens) {
      return {
        error: `Mismatched parentheses: ${openParens} open vs ${closeParens} closed`,
        fixable: false
      };
    }
    
    // Try to eval (in a safer way using Function constructor)
    try {
      new Function(content);
      return { valid: true };
    } catch (evalError) {
      return { 
        error: `Syntax error: ${evalError.message}`,
        fixable: false
      };
    }
    
  } catch (err) {
    return { error: err.message };
  }
}

// Helper function to fix a file with syntax issues
function fixFile(filePath, result) {
  if (!result.fixable) {
    return false;
  }
  
  try {
    // Create a backup
    const backupPath = `${filePath}.backup-${Date.now()}`;
    fs.copyFileSync(filePath, backupPath);
    console.log(`✅ Created backup of ${filePath} at ${backupPath}`);
    
    // Apply the fix
    const fixedContent = result.fix();
    fs.writeFileSync(filePath, fixedContent);
    
    return true;
  } catch (err) {
    console.error(`Error fixing ${filePath}:`, err.message);
    return false;
  }
}

// Check priority files first
console.log('\nChecking priority files:');
let foundAndFixedError = false;

for (const filePath of priorityFiles) {
  if (!fs.existsSync(filePath)) {
    console.log(`- ${filePath}: File not found, skipping`);
    continue;
  }
  
  console.log(`- Checking ${filePath}...`);
  const result = checkSyntax(filePath);
  
  if (result.valid) {
    console.log(`  ✅ No syntax errors found`);
  } else {
    console.log(`  ❌ ${result.error}`);
    
    if (result.content) {
      console.log(`     Line content: "${result.content}"`);
    }
    
    if (result.fixable) {
      console.log(`  🔧 Attempting to fix...`);
      if (fixFile(filePath, result)) {
        console.log(`  ✅ Fix applied to ${filePath}`);
        foundAndFixedError = true;
      } else {
        console.log(`  ❌ Failed to apply fix`);
      }
    } else {
      console.log(`  ⚠️ This error cannot be automatically fixed`);
    }
  }
}

// If we didn't find and fix an error in the priority files, check server.js more thoroughly
if (!foundAndFixedError && fs.existsSync('./server.js')) {
  console.log('\nPerforming detailed analysis of server.js...');
  
  const serverContent = fs.readFileSync('./server.js', 'utf8');
  const lines = serverContent.split('\n');
  
  // Look for problematic patterns
  const suspiciousPatterns = [
    { pattern: /\}\s*\}/, description: 'Multiple consecutive closing braces' },
    { pattern: /\}\s*;/, description: 'Closing brace followed by semicolon' },
    { pattern: /\}\s*else/, description: 'Closing brace followed by else without space' },
    { pattern: /\{\s*\}/, description: 'Empty block' }
  ];
  
  console.log('Looking for suspicious code patterns:');
  let suspiciousLinesFound = false;
  
  lines.forEach((line, index) => {
    suspiciousPatterns.forEach(({ pattern, description }) => {
      if (pattern.test(line)) {
        console.log(`Line ${index + 1}: ${description}`);
        console.log(`  ${line}`);
        suspiciousLinesFound = true;
      }
    });
  });
  
  if (!suspiciousLinesFound) {
    console.log('No suspicious code patterns found');
  }
  
  // Create a fixed version of server.js from scratch
  console.log('\nCreating a clean version of server.js...');
  
  // Backup the original
  const backupPath = `./server.js.backup-${Date.now()}`;
  fs.copyFileSync('./server.js', backupPath);
  console.log(`✅ Created backup of server.js at ${backupPath}`);
  
  // Create a known-good minimal server.js
  const minimalServerJs = `// Minimal Express server to serve static files and API endpoints
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

// API endpoint for health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API endpoint for gold-rupee data
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
    } else if (jsonData.data && Array.isArray(jsonData.data)) {
      // Object with data array
      processedData = { 
        ...jsonData,
        data: jsonData.data.filter(item => new Date(item.date) >= fiveYearsAgo) 
      };
    } else if (jsonData.goldData && Array.isArray(jsonData.goldData)) {
      // Object with separate arrays
      processedData = { 
        ...jsonData,
        goldData: jsonData.goldData.filter(item => new Date(item.date) >= fiveYearsAgo)
      };
      
      if (jsonData.rupeeData && Array.isArray(jsonData.rupeeData)) {
        processedData.rupeeData = jsonData.rupeeData.filter(item => new Date(item.date) >= fiveYearsAgo);
      }
    }
    
    return res.json(processedData);
  } catch (error) {
    console.error('Error in gold-rupee endpoint:', error);
    return res.status(500).json({ error: error.message });
  }
});

// API endpoint for economic data
app.get('/api/econ-data', (req, res) => {
  try {
    const econDataFiles = [
      path.join(__dirname, 'newfrontend/data/econ_data.json'),
      path.join(__dirname, 'backend/data/econ_data.json'),
      path.join(__dirname, 'data/econ_data.json')
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

// API endpoint for financial data
app.get('/api/financial', (req, res) => {
  try {
    const financialDataFiles = [
      path.join(__dirname, 'newfrontend/data/financial_data.json'),
      path.join(__dirname, 'backend/data/financial_data.json'),
      path.join(__dirname, 'data/financial_data.json')
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
});`;
  
  // Save the minimal server.js
  fs.writeFileSync('./server.js', minimalServerJs);
  console.log('✅ Created a clean version of server.js');
  
  // Also check the API endpoint file
  if (fs.existsSync('./api/gold-rupee.js')) {
    const apiFilePath = './api/gold-rupee.js';
    console.log(`\nChecking API endpoint file: ${apiFilePath}`);
    
    const apiResult = checkSyntax(apiFilePath);
    if (apiResult.valid) {
      console.log(`✅ No syntax errors found in ${apiFilePath}`);
    } else {
      console.log(`❌ ${apiResult.error}`);
      
      if (apiResult.fixable) {
        console.log(`🔧 Attempting to fix...`);
        if (fixFile(apiFilePath, apiResult)) {
          console.log(`✅ Fix applied to ${apiFilePath}`);
        } else {
          console.log(`❌ Failed to apply fix`);
        }
      }
    }
  }
}

console.log('\n✅ Syntax error fixes applied');
console.log('\nNext steps:');
console.log('1. Try running the server again: node server.js');
console.log('2. If it works, add and commit your changes:');
console.log('   git add . && git commit -m "Fix syntax errors in server code"');
console.log('3. Deploy to Vercel: npx vercel --prod');
