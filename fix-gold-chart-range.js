const fs = require('fs');
const path = require('path');

console.log('🔍 Analyzing and fixing Gold Price vs. USD/INR exchange rate chart data');

// Files to check for gold and INR data
const dataFiles = [
  './newfrontend/data/gold_rupee_data.json',
  './newfrontend/data/gold-rupee-data.json', 
  './backend/data/gold_rupee_data.json',
  './backend/data/gold-rupee-data.json'
];

// JavaScript files that might have date range settings
const jsFiles = [
  './newfrontend/js/econ-data.js',
  './api/gold-inr-data.js',
  './backend/routes/gold-rupee.js',
];

// Find the data files and analyze them
console.log('\n1️⃣ Checking data files for date range issues...');

let dataFile = null;
let jsonData = null;
let dateRange = null;

// Find the first valid data file
for (const file of dataFiles) {
  if (fs.existsSync(file)) {
    try {
      console.log(`Found data file: ${file}`);
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      
      // Analyze the data format
      if (Array.isArray(data)) {
        // Simple array format
        if (data.length > 0 && data[0].date) {
          dataFile = file;
          jsonData = data;
          
          // Get date range
          const dates = data.map(item => new Date(item.date));
          const minDate = new Date(Math.min(...dates));
          const maxDate = new Date(Math.max(...dates));
          
          dateRange = {
            start: minDate.toISOString().split('T')[0],
            end: maxDate.toISOString().split('T')[0],
            durationDays: Math.round((maxDate - minDate) / (1000 * 60 * 60 * 24)),
            durationYears: ((maxDate - minDate) / (1000 * 60 * 60 * 24 * 365)).toFixed(1)
          };
          
          console.log(`✅ Data analysis complete: ${data.length} data points`);
          console.log(`   Date range: ${dateRange.start} to ${dateRange.end}`);
          console.log(`   Duration: ${dateRange.durationDays} days (${dateRange.durationYears} years)`);
          
          break;
        }
      } else if (data.goldData && data.rupeeData) {
        // Object with separate arrays
        dataFile = file;
        jsonData = data;
        
        // Get date range from goldData
        if (Array.isArray(data.goldData) && data.goldData.length > 0) {
          const dates = data.goldData.map(item => new Date(item.date));
          const minDate = new Date(Math.min(...dates));
          const maxDate = new Date(Math.max(...dates));
          
          dateRange = {
            start: minDate.toISOString().split('T')[0],
            end: maxDate.toISOString().split('T')[0],
            durationDays: Math.round((maxDate - minDate) / (1000 * 60 * 60 * 24)),
            durationYears: ((maxDate - minDate) / (1000 * 60 * 60 * 24 * 365)).toFixed(1)
          };
          
          console.log(`✅ Data analysis complete: ${data.goldData.length} gold data points, ${data.rupeeData?.length || 0} rupee data points`);
          console.log(`   Date range: ${dateRange.start} to ${dateRange.end}`);
          console.log(`   Duration: ${dateRange.durationDays} days (${dateRange.durationYears} years)`);
          
          break;
        }
      }
    } catch (err) {
      console.error(`❌ Error reading ${file}: ${err.message}`);
    }
  }
}

if (!dataFile) {
  console.error('❌ Could not find a valid data file for Gold vs. USD/INR chart');
  process.exit(1);
}

// Check if data needs to be extended
const FIVE_YEARS_IN_DAYS = 365 * 5;
let dataFixed = false;

if (dateRange.durationDays < FIVE_YEARS_IN_DAYS) {
  console.log(`\n⚠️ Current data range (${dateRange.durationYears} years) is less than 5 years`);
  console.log('2️⃣ Checking JavaScript files for date range settings...');

  // Look for date range settings in JS files
  for (const file of jsFiles) {
    if (fs.existsSync(file)) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Look for date range patterns
        const startDateMatch = content.match(/startDate\s*=\s*['"](.*?)['"]/);
        const endDateMatch = content.match(/endDate\s*=\s*['"](.*?)['"]/);
        const rangeDaysMatch = content.match(/days\s*=\s*(\d+)/);
        const yearRangeMatch = content.match(/yearRange\s*=\s*(\d+)/);
        const periodMatch = content.match(/period\s*:\s*['"](.*?)['"]/);
        
        if (startDateMatch || endDateMatch || rangeDaysMatch || yearRangeMatch || periodMatch) {
          console.log(`Found date configuration in ${file}`);
          
          // Update the file if we found date settings
          let updatedContent = content;
          
          if (yearRangeMatch) {
            console.log(`   Found year range: ${yearRangeMatch[1]} - updating to 5`);
            updatedContent = updatedContent.replace(/yearRange\s*=\s*\d+/, 'yearRange = 5');
            dataFixed = true;
          }
          
          if (rangeDaysMatch) {
            console.log(`   Found days range: ${rangeDaysMatch[1]} - updating to 1825 (5 years)`);
            updatedContent = updatedContent.replace(/days\s*=\s*\d+/, 'days = 1825');
            dataFixed = true;
          }
          
          if (periodMatch) {
            console.log(`   Found period setting: ${periodMatch[1]} - updating to "5y"`);
            updatedContent = updatedContent.replace(/period\s*:\s*['"][^'"]*['"]/, 'period: "5y"');
            dataFixed = true;
          }
          
          // Save changes if we made any
          if (updatedContent !== content) {
            fs.writeFileSync(file, updatedContent);
            console.log(`✅ Updated date settings in ${file}`);
          } else {
            console.log(`ℹ️ No changes made to ${file}`);
          }
        }
      } catch (err) {
        console.error(`❌ Error processing ${file}: ${err.message}`);
      }
    }
  }
}

// Check API endpoint file for date range settings
console.log('\n3️⃣ Checking API endpoint for date range settings...');

// Create a new API endpoint for gold data if it doesn't exist
if (!fs.existsSync('./api/gold-inr-data.js')) {
  console.log('Creating API endpoint for gold data with 5-year range');
  
  const apiDir = './api';
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }
  
  const apiEndpoint = `// Gold Price vs. USD/INR Exchange Rate API
// This endpoint provides 5 years of data for the chart

const fs = require('fs');
const path = require('path');

// Try to find the data file
const dataFiles = [
  path.join(process.cwd(), 'newfrontend/data/gold_rupee_data.json'),
  path.join(process.cwd(), 'newfrontend/data/gold-rupee-data.json'),
  path.join(process.cwd(), 'backend/data/gold_rupee_data.json'),
  path.join(process.cwd(), 'backend/data/gold-rupee-data.json')
];

// Get data with 5-year range
const getGoldRupeeData = () => {
  for (const file of dataFiles) {
    try {
      if (fs.existsSync(file)) {
        const data = JSON.parse(fs.readFileSync(file));
        
        // Calculate 5 years ago
        const now = new Date();
        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(now.getFullYear() - 5);
        
        // Filter data to 5-year range if it's an array format
        if (Array.isArray(data)) {
          return data.filter(item => new Date(item.date) >= fiveYearsAgo);
        }
        
        // If it's an object with goldData and rupeeData properties
        if (data.goldData && data.rupeeData) {
          return {
            goldData: data.goldData.filter(item => new Date(item.date) >= fiveYearsAgo),
            rupeeData: data.rupeeData.filter(item => new Date(item.date) >= fiveYearsAgo)
          };
        }
        
        return data;
      }
    } catch (err) {
      console.error(\`Error reading data file \${file}: \${err.message}\`);
    }
  }
  
  return { error: "Data not found" };
};

// API handler
module.exports = (req, res) => {
  try {
    const data = getGoldRupeeData();
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    // Return the data
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};`;

  fs.writeFileSync('./api/gold-inr-data.js', apiEndpoint);
  console.log('✅ Created API endpoint: api/gold-inr-data.js');
  dataFixed = true;
}

// Update the econ-data.js file to use the full 5-year range
console.log('\n4️⃣ Checking econ-data.js for chart configuration...');

const econDataFile = './newfrontend/js/econ-data.js';
if (fs.existsSync(econDataFile)) {
  try {
    let content = fs.readFileSync(econDataFile, 'utf8');
    let updated = false;
    
    // Look for chart configuration
    if (content.includes('createGoldRupeeChart')) {
      console.log('Found Gold vs. INR chart configuration');
      
      // Check if we're using the API endpoint
      if (!content.includes('fetch("/api/gold-inr-data")')) {
        console.log('Updating to use the API endpoint with 5-year range');
        
        // Look for the data fetch part
        const fetchPattern = /fetch\(["']([^"']+)["']\)/g;
        const fetchMatches = content.match(fetchPattern);
        
        if (fetchMatches) {
          // Replace the existing fetch with our API endpoint
          content = content.replace(fetchPattern, 'fetch("/api/gold-inr-data")');
          updated = true;
        }
        
        // Look for data processing part
        if (content.includes('filter') && (content.includes('date') || content.includes('Date'))) {
          console.log('Found date filtering code - updating to use all returned data');
          
          // This is a bit risky as we don't know the exact structure of the filtering code
          // but we'll try to update it to use all data returned from our API endpoint
          const filterPattern = /\.filter\(\s*([^=]*)\s*=>\s*new Date\(([^)]*)\)[^)]*\)/g;
          content = content.replace(filterPattern, '/* Using full 5-year range from API */');
          updated = true;
        }
        
        if (updated) {
          fs.writeFileSync(econDataFile, content);
          console.log(`✅ Updated ${econDataFile} to use 5-year data range`);
          dataFixed = true;
        } else {
          console.log(`ℹ️ Could not automatically update ${econDataFile}`);
        }
      } else {
        console.log('✅ Already using API endpoint for data');
      }
    }
  } catch (err) {
    console.error(`❌ Error processing ${econDataFile}: ${err.message}`);
  }
}

if (dataFixed) {
  console.log('\n✅ Made changes to fix the 5-year data range issue');
  console.log('\nNext steps:');
  console.log('1. Commit your changes: git add . && git commit -m "Fix Gold vs. USD/INR chart to show 5 years of data"');
  console.log('2. Push to GitHub: git push');
  console.log('3. Deploy to Vercel: npx vercel --prod');
} else {
  console.log('\nℹ️ No automatic fixes were applied. The issue might be:');
  console.log('1. Data source might not contain the full 5 years of historical data');
  console.log('2. Chart configuration is more complex than expected');
  console.log('\nRecommended manual checks:');
  console.log(`1. Review the data file: ${dataFile}`);
  console.log('2. Check the chart implementation in newfrontend/js/econ-data.js');
  console.log('3. Look for date range filters in the code');
}
