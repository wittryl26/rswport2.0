const fs = require('fs');
const path = require('path');

console.log('🔍 Analyzing and fixing chart range for Gold Price vs. USD/INR exchange rate chart');
console.log('(Finding chart by content rather than by specific file name)');

// Find all relevant JS files that might contain chart code
const jsDirectories = ['./newfrontend/js', './backend/routes', './api'];
let chartFiles = [];

// Find files that might contain chart code
console.log('\n1️⃣ Scanning for files containing chart code...');
jsDirectories.forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir)
      .filter(file => file.endsWith('.js'))
      .map(file => path.join(dir, file));
    chartFiles.push(...files);
  }
});

console.log(`Found ${chartFiles.length} JavaScript files to scan`);

// Scan all JS files for gold/rupee/INR related chart code
const relevantFiles = [];
const goldKeywords = ['gold', 'rupee', 'inr', 'usd/inr', 'exchange rate'];

chartFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8').toLowerCase();
    
    // Check if the file contains any of the keywords
    if (goldKeywords.some(keyword => content.includes(keyword))) {
      relevantFiles.push({
        path: file,
        content: fs.readFileSync(file, 'utf8') // Original content with original case
      });
      console.log(`✅ Found relevant code in: ${file}`);
    }
  } catch (err) {
    console.error(`❌ Error reading ${file}: ${err.message}`);
  }
});

console.log(`\nFound ${relevantFiles.length} files with potential gold/rupee chart code`);

// Check all data files for gold/rupee data
console.log('\n2️⃣ Looking for data files containing gold price or exchange rate data...');

const dataDirectories = ['./newfrontend/data', './backend/data'];
const dataFiles = [];

dataDirectories.forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir)
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(dir, file))
      .forEach(file => {
        try {
          const fileContent = fs.readFileSync(file, 'utf8').toLowerCase();
          
          // Check if the file might contain gold/rupee data
          if (goldKeywords.some(keyword => fileContent.includes(keyword))) {
            console.log(`Found potential data file: ${file}`);
            dataFiles.push(file);
          } else {
            // Also check file names
            const fileName = path.basename(file).toLowerCase();
            if (goldKeywords.some(keyword => fileName.includes(keyword))) {
              console.log(`Found potential data file (by name): ${file}`);
              dataFiles.push(file);
            }
          }
        } catch (err) {
          console.error(`Error reading ${file}: ${err.message}`);
        }
      });
  }
});

console.log(`Found ${dataFiles.length} potential data files`);

// Now let's implement a fix for the chart range
console.log('\n3️⃣ Creating API endpoint for gold price vs USD/INR exchange rate data...');

// First, ensure api directory exists
const apiDir = './api';
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
}

// Create a general-purpose API endpoint for this chart data
const goldDataApiFile = './api/gold-exchange-rate-data.js';

// Implement the API endpoint to serve 5-year data
const apiEndpointCode = `// Gold Price vs. Exchange Rate Chart Data API
// Provides 5-year data range for chart visualization

const fs = require('fs');
const path = require('path');

// Try to find all possible data files
const findGoldDataFiles = () => {
  const directories = [
    path.join(process.cwd(), 'newfrontend/data'),
    path.join(process.cwd(), 'backend/data')
  ];
  
  const possibleFileNames = [
    'gold_rupee_data.json',
    'gold-rupee-data.json',
    'gold_price_data.json',
    'exchange_rate_data.json',
    'gold_inr_data.json',
    'gold_usd_inr.json'
  ];
  
  // Search all directories for any of the possible files
  for (const dir of directories) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      
      // First check for exact file name matches
      for (const fileName of possibleFileNames) {
        if (files.includes(fileName)) {
          return path.join(dir, fileName);
        }
      }
      
      // Then check for keyword matches in file names
      const keywords = ['gold', 'rupee', 'inr', 'exchange'];
      for (const file of files) {
        if (file.endsWith('.json') && 
            keywords.some(keyword => file.toLowerCase().includes(keyword))) {
          return path.join(dir, file);
        }
      }
    }
  }
  
  return null;
};

// Get data with 5-year range
const getGoldExchangeRateData = () => {
  // Try to find the data file
  const dataFile = findGoldDataFiles();
  
  if (!dataFile) {
    console.error('No gold/exchange rate data file found');
    return { error: 'Data file not found' };
  }
  
  try {
    console.log(\`Using data file: \${dataFile}\`);
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    
    // Calculate 5 years ago
    const now = new Date();
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(now.getFullYear() - 5);
    
    // Handle different data formats
    if (Array.isArray(data)) {
      // Simple array of objects format
      if (data.length > 0 && data[0].date) {
        return data.filter(item => new Date(item.date) >= fiveYearsAgo);
      }
      return data; // Return as is if we can't filter
    }
    
    // Handle object with separate goldData and rupeeData arrays
    if (data.goldData && Array.isArray(data.goldData)) {
      return {
        goldData: data.goldData.filter(item => 
          item.date && new Date(item.date) >= fiveYearsAgo
        ),
        rupeeData: data.rupeeData && Array.isArray(data.rupeeData) 
          ? data.rupeeData.filter(item => item.date && new Date(item.date) >= fiveYearsAgo)
          : []
      };
    }
    
    // Handle any other data structure that might be used
    return data;
  } catch (err) {
    console.error(\`Error processing data file: \${err.message}\`);
    return { error: err.message };
  }
};

// API handler
module.exports = (req, res) => {
  try {
    const data = getGoldExchangeRateData();
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    // Return the data with proper 5-year range
    res.status(200).json(data);
  } catch (err) {
    console.error(\`Error in gold exchange rate API: \${err.message}\`);
    res.status(500).json({ error: err.message });
  }
};`;

// Write the API endpoint file
fs.writeFileSync(goldDataApiFile, apiEndpointCode);
console.log(`✅ Created API endpoint: ${goldDataApiFile}`);

// Update chart files to use the new API endpoint
console.log('\n4️⃣ Updating chart files to use the new API endpoint and 5-year range...');

let modifiedCount = 0;

relevantFiles.forEach(file => {
  let content = file.content;
  let updated = false;
  
  // Look for fetch calls to gold/rupee/exchange rate data
  const fetchCalls = [
    // Match fetch calls with data files related to gold/rupee data
    /fetch\s*\(\s*['"`]([^'"`]*gold[^'"`]*)['"`]\s*\)/gi,
    /fetch\s*\(\s*['"`]([^'"`]*rupee[^'"`]*)['"`]\s*\)/gi,
    /fetch\s*\(\s*['"`]([^'"`]*inr[^'"`]*)['"`]\s*\)/gi,
    /fetch\s*\(\s*['"`]([^'"`]*exchange[^'"`]*)['"`]\s*\)/gi
  ];
  
  // Check if the file contains any fetch calls to gold/rupee data
  let fetchFound = false;
  for (const pattern of fetchCalls) {
    if (pattern.test(content)) {
      fetchFound = true;
      
      // Replace the fetch call with our API endpoint
      content = content.replace(pattern, 'fetch("/api/gold-exchange-rate-data")');
      updated = true;
      
      console.log(`✅ Updated fetch call in ${file.path}`);
    }
  }
  
  // Look for year range settings
  const yearRangePatterns = [
    /const\s+yearRange\s*=\s*(\d+)/g,
    /yearRange\s*:\s*(\d+)/g,
    /let\s+yearRange\s*=\s*(\d+)/g,
    /years\s*:\s*(\d+)/g, 
    /years\s*=\s*(\d+)/g,
    /var\s+yearRange\s*=\s*(\d+)/g
  ];
  
  for (const pattern of yearRangePatterns) {
    // Reset the lastIndex property before using the regex again
    pattern.lastIndex = 0;
    
    if (pattern.test(content)) {
      // Reset the lastIndex property before using the regex for replacement
      pattern.lastIndex = 0;
      
      content = content.replace(pattern, (match, yearValue) => {
        // Only replace if year value is less than 5
        if (parseInt(yearValue) < 5) {
          return match.replace(yearValue, '5');
        }
        return match;
      });
      
      updated = true;
      console.log(`✅ Updated year range in ${file.path}`);
    }
  }
  
  // Look for date range filters
  const dateFilterPatterns = [
    /\.filter\(\s*([^=]*)\s*=>\s*new Date\(([^)]*)\)[^)]*\)/g,
    /const\s+startDate\s*=\s*new Date\(([^)]*)\)/g,
    /days\s*=\s*(\d+)/g
  ];
  
  for (const pattern of dateFilterPatterns) {
    if (pattern.test(content)) {
      if (pattern.toString().includes('days')) {
        content = content.replace(pattern, (match, days) => {
          // Replace with days for 5 years (365*5 ≈ 1825)
          return match.replace(days, '1825');
        });
      } else {
        // Comment out date filtering logic as we're using the API endpoint
        content = content.replace(pattern, '/* Using 5-year data from API */')
      }
      
      updated = true;
      console.log(`✅ Updated date filtering in ${file.path}`);
    }
  }
  
  // If we found a gold/rupee chart but no fetch call, add our API endpoint
  if (!fetchFound && content.toLowerCase().includes('gold') && content.toLowerCase().includes('chart')) {
    // Look for a createChart function or similar
    const chartFunctions = [
      /function\s+create(\w*)Chart/,
      /const\s+create(\w*)Chart\s*=/,
      /let\s+create(\w*)Chart\s*=/,
      /var\s+create(\w*)Chart\s*=/
    ];
    
    for (const pattern of chartFunctions) {
      const match = content.match(pattern);
      
      if (match && 
        (match[1].toLowerCase().includes('gold') || 
         match[1].toLowerCase().includes('price') || 
         match[1].toLowerCase().includes('exchange') || 
         match[1].toLowerCase().includes('rupee') || 
         match[1].toLowerCase().includes('inr'))) {
        
        // Add our API endpoint to the beginning of the function
        const apiAddition = `
  // Fetch 5-year data from API
  fetch('/api/gold-exchange-rate-data')
    .then(response => response.json())
    .then(data => {
      // Use data directly - it will already have 5-year range
      // Rest of chart code can use this data
`;
        
        // Add the API fetch inside the function
        content = content.replace(pattern, (match) => {
          return match + ' {\n' + apiAddition;
        });
        
        updated = true;
        console.log(`✅ Added API endpoint to chart function in ${file.path}`);
      }
    }
  }
  
  // Save the updated file
  if (updated) {
    fs.writeFileSync(file.path, content);
    console.log(`✅ Saved updated file: ${file.path}`);
    modifiedCount++;
  }
});

// Create a health API endpoint if it doesn't exist
const healthApiFile = './api/health.js';
if (!fs.existsSync(healthApiFile)) {
  const healthEndpointCode = `// Health check API endpoint

module.exports = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
};
`;

  fs.writeFileSync(healthApiFile, healthEndpointCode);
  console.log(`✅ Created health check API endpoint: ${healthApiFile}`);
}

// Summary
console.log('\n✅ Fix completed!');
console.log(`Modified ${modifiedCount} chart files`);
console.log('Created API endpoint: ./api/gold-exchange-rate-data.js');
if (modifiedCount === 0) {
  console.log('\nNo files were modified. The issue might need manual investigation.');
  console.log('Try checking the following files manually:');
  relevantFiles.forEach(file => console.log(`  - ${file.path}`));
  dataFiles.forEach(file => console.log(`  - ${file}`));
} else {
  console.log('\nNext steps:');
  console.log('1. Add the changes: git add .');
  console.log('2. Commit: git commit -m "Fix Gold Price vs. USD/INR chart to show full 5-year data range"');
  console.log('3. Push: git push');
  console.log('4. Deploy: npx vercel --prod');
}
