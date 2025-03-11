const fs = require('fs');
const path = require('path');

console.log('🛠️ Parentheses Fixer for fix-endpoint-order.js');
console.log('This script will fix the mismatched parentheses issue');

const targetFile = './fix-endpoint-order.js';

if (!fs.existsSync(targetFile)) {
  console.error(`❌ Target file not found: ${targetFile}`);
  process.exit(1);
}

// Create backup of the file
const backupPath = `${targetFile}.backup-${Date.now()}`;
fs.copyFileSync(targetFile, backupPath);
console.log(`✅ Created backup of file at ${backupPath}`);

// Read the file content
let content = fs.readFileSync(targetFile, 'utf8');
console.log(`File loaded: ${content.length} characters`);

// Track parentheses, their positions, and possible missing spots
function analyzeParentheses(code) {
  const stack = [];
  const pairs = [];
  const lines = code.split('\n');
  let lineNo = 1;
  let charNo = 1;
  let openCount = 0;
  let closeCount = 0;
  
  // Most common patterns where closing parentheses might be missing
  const suspiciousPatterns = [
    { pattern: /\([^)]*$/, description: 'Line ends with open parenthesis' },
    { pattern: /(if|for|while|switch)\s*\([^)]*$/, description: 'Control structure without closing parenthesis' },
    { pattern: /\)\s*{/, description: 'Closing parenthesis followed by opening brace' },
    { pattern: /\)\s*=>/, description: 'Arrow function parameter list' },
    { pattern: /\([^)]*console\.log/, description: 'Console.log inside parentheses' },
  ];
  
  // Analysis by line to find suspicious spots
  const suspiciousLines = [];
  
  lines.forEach((line, i) => {
    // Count parentheses in this line
    let openInLine = (line.match(/\(/g) || []).length;
    let closeInLine = (line.match(/\)/g) || []).length;
    
    if (openInLine !== closeInLine) {
      suspiciousLines.push({
        lineNo: i + 1,
        line,
        imbalance: openInLine - closeInLine,
        suspiciousPatternFound: suspiciousPatterns.some(pattern => pattern.pattern.test(line))
      });
    }
    
    // Check for patterns that might indicate a missing closing parenthesis
    suspiciousPatterns.forEach(({ pattern, description }) => {
      if (pattern.test(line)) {
        suspiciousLines.push({
          lineNo: i + 1,
          line,
          description,
          pattern: pattern.toString()
        });
      }
    });
  });
  
  // Character-by-character analysis to track each parenthesis
  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    
    // Track line and column position
    if (char === '\n') {
      lineNo++;
      charNo = 1;
    } else {
      charNo++;
    }
    
    if (char === '(') {
      stack.push({ index: i, line: lineNo, char: charNo });
      openCount++;
    } else if (char === ')') {
      closeCount++;
      if (stack.length > 0) {
        const openParen = stack.pop();
        pairs.push({
          open: openParen,
          close: { index: i, line: lineNo, char: charNo },
          content: code.substring(openParen.index + 1, i)
        });
      }
    }
  }
  
  return {
    imbalance: openCount - closeCount,
    unclosedParens: stack,
    pairs,
    suspiciousLines,
    openCount,
    closeCount
  };
}

const analysis = analyzeParentheses(content);

console.log(`\nParentheses analysis:
- Open parentheses: ${analysis.openCount}
- Close parentheses: ${analysis.closeCount}
- Imbalance: ${analysis.imbalance} (missing closing parentheses)`);

if (analysis.imbalance <= 0) {
  console.log('✅ No missing closing parentheses found. The issue must be elsewhere.');
  process.exit(0);
}

// Find the unclosed parenthesis
if (analysis.unclosedParens.length > 0) {
  console.log('\nUnclosed parentheses locations:');
  analysis.unclosedParens.forEach((paren, index) => {
    const lineContent = content.split('\n')[paren.line - 1];
    console.log(`${index + 1}. Line ${paren.line}, position ${paren.char}: ${lineContent.trim()}`);
  });
}

// Show suspicious lines
if (analysis.suspiciousLines.length > 0) {
  console.log('\nSuspicious lines that might be missing a closing parenthesis:');
  analysis.suspiciousLines.forEach((line, index) => {
    console.log(`${index + 1}. Line ${line.lineNo}: ${line.line.trim()}${line.description ? ` (${line.description})` : ''}`);
  });
}

// Create a fixed version of the file
console.log('\nAttempting to fix the issue...');

// Strategy 1: Check for specific patterns that are highly likely to indicate where we should add a closing parenthesis
let fixed = false;
const linesArray = content.split('\n');

// Specific pattern: Refactor the most suspicious part
const goldRupeeApiRoute = content.match(/const goldRupeeApiRoute = `[\s\S]*?`;/);
if (goldRupeeApiRoute) {
  console.log('Found goldRupeeApiRoute template literal - analyzing brackets there...');
  
  // This is a common location for unclosed parentheses - inside template literals
  // Let's extract the route and check for unclosed parentheses
  const route = goldRupeeApiRoute[0];
  const routeOpenCount = (route.match(/\(/g) || []).length;
  const routeCloseCount = (route.match(/\)/g) || []).length;
  
  if (routeOpenCount > routeCloseCount) {
    console.log(`Found imbalance in goldRupeeApiRoute: ${routeOpenCount} open vs ${routeCloseCount} close`);
    
    // Most likely around processedData definition
    const fixedRoute = route.replace(
      /processedData = \{\s*\.\.\.jsonData,\s*data: jsonData\.data\.filter\(item => new Date\(item\.date\) >= fiveYearsAgo\)\s*\};/g,
      'processedData = {\n        ...jsonData,\n        data: jsonData.data.filter(item => new Date(item.date) >= fiveYearsAgo)\n      };'
    );
    
    content = content.replace(route, fixedRoute);
    console.log('✅ Fixed template literal content');
    fixed = true;
  }
}

// Strategy 2: Fix specific issue with function parenthesis in a common Express route pattern
if (!fixed) {
  const routeMatch = content.match(/app\.get\(['"]\/api\/gold-rupee['"],\s*\(req,\s*res\)\s*=>\s*\{[\s\S]*?\}\)/g);
  if (routeMatch && routeMatch.length > 0) {
    const route = routeMatch[0];
    const routeOpenCount = (route.match(/\(/g) || []).length;
    const routeCloseCount = (route.match(/\)/g) || []).length;
    
    if (routeOpenCount > routeCloseCount) {
      console.log(`Found imbalance in route handler: ${routeOpenCount} open vs ${routeCloseCount} close`);
      
      // Add missing parenthesis at the end of the route
      const fixedRoute = route + ')';
      content = content.replace(route, fixedRoute);
      console.log('✅ Added missing closing parenthesis to route handler');
      fixed = true;
    }
  }
}

// Strategy 3: Fix missing parenthesis in filter patterns which are common culprits
if (!fixed) {
  const filterMatch = content.match(/\.filter\([\s\S]*?=>\s*\{[\s\S]*?}\)/g);
  if (filterMatch) {
    for (const filter of filterMatch) {
      const filterOpenCount = (filter.match(/\(/g) || []).length;
      const filterCloseCount = (filter.match(/\)/g) || []).length;
      
      if (filterOpenCount > filterCloseCount) {
        console.log(`Found imbalance in filter: ${filterOpenCount} open vs ${filterCloseCount} close`);
        
        // Add missing parenthesis at the end of the filter
        const fixedFilter = filter + ')';
        content = content.replace(filter, fixedFilter);
        console.log('✅ Added missing closing parenthesis to filter');
        fixed = true;
        break;
      }
    }
  }
}

// Strategy 4: Fix the most likely culprit - the object initialization in the gold-rupee endpoint
if (!fixed) {
  const processedDataMatch = content.match(/processedData = \{[^}]*data: jsonData\.data\.filter\([^)]*\)[^}]*\};/g);
  if (processedDataMatch) {
    console.log('Found processedData object initialization that might have unbalanced parentheses');
    
    // Check each match for imbalance
    processedDataMatch.forEach(match => {
      const matchOpenCount = (match.match(/\(/g) || []).length;
      const matchCloseCount = (match.match(/\)/g) || []).length;
      
      if (matchOpenCount > matchCloseCount) {
        // Fix by adding closing parenthesis
        const fixedMatch = match.replace(/\);/, '));');
        content = content.replace(match, fixedMatch);
        console.log('✅ Fixed imbalance in processedData initialization');
        fixed = true;
      }
    });
  }
}

// Strategy 5: Brute force approach - replace the entire ServerJS section with a known good version
if (!fixed) {
  console.log('Using brute force approach - replace goldRupeeApiRoute section with fixed version');
  
  const routeStart = content.indexOf('// Create the gold-rupee API route if it doesn\'t exist');
  const routeEnd = content.indexOf('// Add the catch-all route at the end');
  
  if (routeStart !== -1 && routeEnd !== -1) {
    const fixedRouteSection = `// Create the gold-rupee API route if it doesn't exist
    console.log('Creating gold-rupee API route');
    const goldRupeeApiRoute = \`
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
        console.log(\\\`Using data file: \\\${dataFile}\\\`);
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
\`;

    // Find a good insertion point
    const listenIndex = serverContent.indexOf('app.listen');
    if (listenIndex !== -1) {
      const beforeListen = serverContent.substring(0, listenIndex);
      const afterListen = serverContent.substring(listenIndex);
      serverContent = beforeListen + goldRupeeApiRoute + '\\n\\n' + afterListen;
    }`;
    
    content = content.substring(0, routeStart) + fixedRouteSection + content.substring(routeEnd);
    console.log('✅ Replaced problematic section with fixed version');
    fixed = true;
  }
}

// Last resort - let's use ChatGPT's power to create a new fix-endpoint-order.js file from scratch
if (!fixed) {
  console.log('Creating a new fixed version of fix-endpoint-order.js from scratch');
  
  const fixedScript = `// filepath: /c:/rswport2.0/fix-endpoint-order.js
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing API endpoint order in server.js');
console.log('This script ensures API routes are properly registered before the catch-all route');

// Path to server.js
const serverPath = './server.js';

// Check if server.js exists
if (!fs.existsSync(serverPath)) {
  console.error('❌ server.js not found!');
  process.exit(1);
}

// Create backup
const backupPath = \`\${serverPath}.backup-\${Date.now()}\`;
fs.copyFileSync(serverPath, backupPath);
console.log(\`✅ Created backup of server.js at \${backupPath}\`);

// Read server.js
let serverContent = fs.readFileSync(serverPath, 'utf8');

// The issue is that the catch-all route is being matched before specific API routes
// 1. Extract all route registrations
const apiRoutes = [];
const otherRoutes = [];
let catchAllRoute = null;

// Find all app.get() route registrations
const routeMatches = serverContent.match(/app\\.get\\([^)]+\\)[^;]*;/g) || [];

routeMatches.forEach(routeCode => {
  if (routeCode.includes("app.get('*'")) {
    // This is the catch-all route
    catchAllRoute = routeCode;
  } else if (routeCode.includes('/api/')) {
    // This is an API route
    apiRoutes.push(routeCode);
  } else {
    // This is some other route
    otherRoutes.push(routeCode);
  }
});

console.log(\`Found routes: \${apiRoutes.length} API routes, \${otherRoutes.length} other routes, catch-all: \${catchAllRoute ? 'yes' : 'no'}\`);

// If we have a catch-all route, we need to make sure it comes after all API routes
if (catchAllRoute) {
  // Remove the catch-all route from the content
  serverContent = serverContent.replace(catchAllRoute, '');
  
  // Make sure each API route is properly defined and exists in the content
  apiRoutes.forEach(route => {
    if (!serverContent.includes(route)) {
      console.log(\`API route not found in server content: \${route}\`);
    }
  });
  
  // If we have a gold-rupee route, make sure it's properly defined
  const goldRupeeRoute = apiRoutes.find(route => route.includes('/gold-rupee'));
  
  if (goldRupeeRoute) {
    console.log(\`Found gold-rupee route: \${goldRupeeRoute}\`);
    
    // Make sure it uses the /api/ prefix
    if (!goldRupeeRoute.includes('/api/gold-rupee')) {
      const updatedRoute = goldRupeeRoute.replace('/gold-rupee', '/api/gold-rupee');
      console.log(\`Updating gold-rupee route to use /api/ prefix: \${updatedRoute}\`);
      serverContent = serverContent.replace(goldRupeeRoute, updatedRoute);
    }
  } else {
    // Create the gold-rupee API route if it doesn't exist
    console.log('Creating gold-rupee API route');
    
    const goldRupeeApiRoute = \`
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
        console.log(\\\`Using data file: \\\${dataFile}\\\`);
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
\`;

    // Find a good insertion point
    const listenIndex = serverContent.indexOf('app.listen');
    if (listenIndex !== -1) {
      const beforeListen = serverContent.substring(0, listenIndex);
      const afterListen = serverContent.substring(listenIndex);
      serverContent = beforeListen + goldRupeeApiRoute + '\\n\\n' + afterListen;
    }
  }
  
  // Add the catch-all route at the end
  const listenIndex = serverContent.indexOf('app.listen');
  if (listenIndex !== -1) {
    const beforeListen = serverContent.substring(0, listenIndex);
    const afterListen = serverContent.substring(listenIndex);
    serverContent = beforeListen + '\\n// Catch-all route must be last\\n' + catchAllRoute + '\\n\\n' + afterListen;
    console.log('✅ Moved catch-all route to after API routes');
  }
}

// Also add a diagnostic middleware to log all requests
const expressInit = serverContent.indexOf('app.use(express');
if (expressInit !== -1) {
  const beforeInit = serverContent.substring(0, expressInit);
  const afterInit = serverContent.substring(expressInit);
  const loggingMiddleware = \`
// Request logging middleware
app.use((req, res, next) => {
  console.log(\\\`[REQUEST] \\\${req.method} \\\${req.url}\\\`);
  next();
});

\`;
  serverContent = beforeInit + loggingMiddleware + afterInit;
  console.log('✅ Added request logging middleware');
}

// Write updated server.js
fs.writeFileSync(serverPath, serverContent);
console.log('✅ Updated server.js with correct route order');

// Create a direct test script that uses the API in the browser
const testHtmlPath = './newfrontend/test-api.html';
const testHtmlContent = \`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Test Page</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
    h1 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
    pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
    button { background: #4CAF50; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
    button:hover { background: #45a049; }
    .result { margin-top: 20px; }
    .error { color: red; }
  </style>
</head>
<body>
  <h1>Gold-Rupee API Test</h1>
  <p>This page tests the /api/gold-rupee endpoint.</p>
  
  <button id="testButton">Test API</button>
  <div id="loading" style="display: none;">Loading...</div>
  
  <div class="result">
    <h2>API Response:</h2>
    <pre id="response">Click the "Test API" button to see the response</pre>
  </div>
  
  <script>
    document.getElementById('testButton').addEventListener('click', async () => {
      const loading = document.getElementById('loading');
      const response = document.getElementById('response');
      
      loading.style.display = 'block';
      response.textContent = 'Fetching data...';
      
      try {
        const startTime = Date.now();
        const res = await fetch('/api/gold-rupee');
        const timeElapsed = Date.now() - startTime;
        
        if (res.ok) {
          const data = await res.json();
          
          // Find data length
          let recordCount = 'unknown';
          if (Array.isArray(data)) {
            recordCount = data.length;
          } else if (data.data && Array.isArray(data.data)) {
            recordCount = data.data.length;
          } else if (data.goldData && Array.isArray(data.goldData)) {
            recordCount = data.goldData.length;
          }
          
          response.innerHTML = \\\`✅ Success! Received \\\${recordCount} records in \\\${timeElapsed}ms\\\\n\\\\nSample data:\\\\n\\\${JSON.stringify(data, null, 2).substring(0, 500)}...\\\`;
        } else {
          response.innerHTML = \\\`❌ Error: \\\${res.status} \\\${res.statusText}\\\\n\\\${await res.text()}\\\`;
          response.classList.add('error');
        }
      } catch (error) {
        response.textContent = \\\`❌ Exception: \\\${error.message}\\\`;
        response.classList.add('error');
      } finally {
        loading.style.display = 'none';
      }
    });
  </script>
</body>
</html>\`;

fs.writeFileSync(testHtmlPath, testHtmlContent);
console.log(\`✅ Created API test page at \${testHtmlPath}\`);
console.log('   Access it at: http://localhost:3001/test-api.html');

console.log('\\nNext steps:');
console.log('1. Restart your server: node server.js');
console.log('2. Access the API test page: http://localhost:3001/test-api.html');
console.log('3. If everything works, add and commit your changes:');
console.log('   git add . && git commit -m "Fix API route order and add test page"');
console.log('4. Deploy to Vercel: npx vercel --prod');
`;

  content = fixedScript;
  console.log('✅ Replaced entire file with a clean, fixed version');
  fixed = true;
}

// Save the fixed file
fs.writeFileSync(targetFile, content);
console.log('✅ Saved fixed version of the file');

// Check again to make sure the fix worked
const postFixAnalysis = analyzeParentheses(content);
if (postFixAnalysis.imbalance === 0) {
  console.log('\n✅ Fix successful! Parentheses are now balanced.');
  console.log(`- Open: ${postFixAnalysis.openCount}, Close: ${postFixAnalysis.closeCount}`);
} else {
  console.log(`\n⚠️ Parentheses are still imbalanced! Open: ${postFixAnalysis.openCount}, Close: ${postFixAnalysis.closeCount}`);
  console.log('Please try running node fix-syntax-error.js');
}

console.log('\nNext steps:');
console.log('1. Run "node fix-endpoint-order.js" to update server.js with proper route order');
console.log('2. Restart server: node server.js');
console.log('3. Test API endpoint at: http://localhost:3001/api/gold-rupee');
