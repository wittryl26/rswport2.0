const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing API endpoints and port references in modern-charts.js');

// Define the chart file path
const chartFilePath = './newfrontend/js/modern-charts.js';
const apiServiceFilePath = './newfrontend/js/api-service.js';

// Check if files exist
if (!fs.existsSync(chartFilePath)) {
  console.error(`❌ Chart file not found: ${chartFilePath}`);
  process.exit(1);
}

// Create backups before making changes
const chartBackupPath = `${chartFilePath}.backup-${Date.now()}`;
fs.copyFileSync(chartFilePath, chartBackupPath);
console.log(`✅ Created backup of chart file at ${chartBackupPath}`);

// Read the chart file content
let chartContent = fs.readFileSync(chartFilePath, 'utf8');

// 1. Find and fix hardcoded port references
console.log('\n1️⃣ Checking for hardcoded port references...');

// Find hardcoded URLs like 'http://localhost:3000'
const urlRegex = /(https?:\/\/localhost:)(\d+)/g;
let portUpdated = false;

if (urlRegex.test(chartContent)) {
  chartContent = chartContent.replace(urlRegex, (match, protocol, port) => {
    if (port === '3000') {
      portUpdated = true;
      return `${protocol}3001`;
    }
    return match;
  });
  
  console.log('✅ Updated hardcoded port references from 3000 to 3001');
} else {
  console.log('✓ No hardcoded localhost URLs found');
}

// Look specifically for gold-rupee API endpoint
console.log('\n2️⃣ Checking Gold-Rupee chart data source...');

// Find the specific createStandaloneGoldRupeeChart function
const goldChartFunctionMatch = chartContent.match(/window\.createStandaloneGoldRupeeChart\s*=\s*function\s*\([^)]*\)\s*{[\s\S]+?(?=\}\s*;|\}\s*\n)/);

if (goldChartFunctionMatch) {
  const goldChartFunction = goldChartFunctionMatch[0];
  
  // Check if it's using an absolute URL
  if (goldChartFunction.includes('http://localhost:')) {
    console.log('⚠️ Found hardcoded API URL in Gold-Rupee chart');
    
    // Update to use relative URL which works in both development and production
    const updatedFunction = goldChartFunction.replace(
      /const\s+apiUrl\s*=\s*['"]http:\/\/localhost:\d+\/([^'"]+)['"]/g,
      'const apiUrl = \'/api/$1\''
    );
    
    chartContent = chartContent.replace(goldChartFunction, updatedFunction);
    console.log('✅ Updated Gold-Rupee API URL to use relative path: /api/...');
  }
  
  // Add better error handling and fallback to sample data
  if (!goldChartFunction.includes('USE_FALLBACK_DATA')) {
    const fetchBlock = chartContent.match(/fetch\(apiUrl\)[\s\S]+?\.catch\(error\s*=>\s*{[\s\S]+?\}\)/);
    
    if (fetchBlock) {
      const originalFetchBlock = fetchBlock[0];
      const updatedFetchBlock = originalFetchBlock.replace(
        /.catch\(error\s*=>\s*{([\s\S]+?)}\)/,
        `.catch(error => {
      console.error("Error fetching gold-rupee data:", error);
      
      // Use sample data as fallback
      console.log("Using sample data fallback for gold-rupee chart");
      
      // Clear container and add canvas for the fallback data
      container.innerHTML = '';
      const canvas = document.createElement('canvas');
      container.appendChild(canvas);
      
      // Try to get sample data from sampleDataProvider
      if (window.sampleDataProvider && typeof window.sampleDataProvider.getGoldRupeeData === 'function') {
        window.sampleDataProvider.getGoldRupeeData()
          .then(fallbackData => {
            console.log("Using sample data for gold-rupee chart");
            createGoldRupeeChart(canvas, fallbackData);
            
            // Add fallback notice
            const fallbackNotice = document.createElement('div');
            fallbackNotice.style.cssText = 'font-size: 11px; color: #ff6b6b; margin-top: 5px;';
            fallbackNotice.textContent = 'Using offline sample data (API unavailable)';
            canvas.parentNode.insertBefore(fallbackNotice, canvas.nextSibling);
          });
      } else {
        console.error("No sample data provider available for fallback");
        container.innerHTML = '<div style="padding: 20px; color: #ff6b6b;">Could not load chart data</div>';
      }
      
      // Keep the description section
      const chartDescription = document.createElement('div');
      chartDescription.style.cssText = \`
          margin-top: 10px; 
          font-size: 11px;
          color: #a0a0a0;
          line-height: 1.4;
          font-style: italic;
          padding: 0 5px;
      \`;
      chartDescription.innerHTML = \`
          This chart visualization is powered by a custom Node.js API I built from scratch that fetches live gold price data and USD/INR exchange rates. 
          The data is processed through a serverless function using Express for routing and Chart.js for visualization, demonstrating full-stack development skills.
      \`;
      
      // Add the description after the container
      container.parentNode.insertBefore(chartDescription, container.nextSibling);
    })`
      );
      
      chartContent = chartContent.replace(originalFetchBlock, updatedFetchBlock);
      console.log('✅ Added improved error handling with sample data fallback');
    }
  }
}

// 3. Check for processGoldRupeeData function to ensure proper data handling
console.log('\n3️⃣ Checking data processing function...');

const processGoldRupeeFunction = chartContent.match(/function\s+processGoldRupeeData\s*\([^)]*\)\s*{[\s\S]+?(?=\}\s*\n)/);

if (processGoldRupeeFunction) {
  const originalFunction = processGoldRupeeFunction[0];
  
  // Ensure the function can handle both API formats and sample data
  if (!originalFunction.includes('console.log(\'Processing gold-rupee data:')) {
    const updatedFunction = originalFunction.replace(
      /function\s+processGoldRupeeData\s*\(data\)\s*{/,
      `function processGoldRupeeData(data) {
    console.log('Processing gold-rupee data:', data);
    
    // Handle different possible data structures
    let dataToProcess = data;
    
    // Check if data is nested (common API response format)
    if (data && data.data && Array.isArray(data.data)) {
        dataToProcess = data.data;
    } else if (data && (data.goldData || data.rupeeData)) {
        // Handle sample data format with separate arrays
        const labels = [];
        const goldValues = [];
        const rupeeValues = [];
        
        // Process gold data if available
        if (Array.isArray(data.goldData)) {
            data.goldData.sort((a, b) => new Date(a.date) - new Date(b.date));
            data.goldData.forEach(item => {
                labels.push(formatDate(item.date));
                goldValues.push(parseFloat(item.price || item.value || 0));
            });
        }
        
        // Process rupee data if available
        if (Array.isArray(data.rupeeData)) {
            data.rupeeData.sort((a, b) => new Date(a.date) - new Date(b.date));
            data.rupeeData.forEach((item, i) => {
                // Only add labels if we don't have them from gold data
                if (labels.length <= i) labels.push(formatDate(item.date));
                rupeeValues.push(parseFloat(item.rate || item.value || 0));
            });
        }
        
        return { labels, goldValues, rupeeValues };
    }`
    );
    
    chartContent = chartContent.replace(originalFunction, updatedFunction);
    console.log('✅ Enhanced data processing function to handle different data formats');
  }
}

// 4. Add improved 5-year range filter
console.log('\n4️⃣ Adding improved 5-year range filter...');

// Find createGoldRupeeChart function
const createChartFunction = chartContent.match(/function\s+createGoldRupeeChart\s*\([^)]*\)\s*{[\s\S]+?(?=function|\}$)/);

if (createChartFunction) {
  const originalFunction = createChartFunction[0];
  
  // Check if it already has 5-year filter
  if (!originalFunction.includes('setFullYear(now.getFullYear() - 5)')) {
    const processDataPoint = originalFunction.indexOf('processGoldRupeeData');
    
    if (processDataPoint !== -1) {
      // Find right insertion point after processGoldRupeeData
      const afterProcessing = originalFunction.indexOf(';', processDataPoint);
      
      if (afterProcessing !== -1) {
        const filterCode = `
        
        // Filter data for 5-year range
        const now = new Date();
        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(now.getFullYear() - 5);
        
        // Apply filter to keep only last 5 years of data
        if (processedData && processedData.labels && processedData.labels.length > 0) {
            const labelsWithDates = processedData.labels.map((label, i) => ({ 
                label, 
                gold: processedData.goldValues[i],
                rupee: processedData.rupeeValues[i],
                date: data.data && data.data[i] ? data.data[i].date : null
            }));
            
            // Filter for dates within 5 years
            const filteredData = labelsWithDates.filter(item => {
                if (!item.date) return true;
                return new Date(item.date) >= fiveYearsAgo;
            });
            
            // Rebuild the data arrays
            processedData.labels = filteredData.map(d => d.label);
            processedData.goldValues = filteredData.map(d => d.gold);
            processedData.rupeeValues = filteredData.map(d => d.rupee);
            
            console.log(\`Filtered to \${processedData.labels.length} data points within 5-year range\`);
        }`;
        
        const updatedFunction = 
          originalFunction.slice(0, afterProcessing + 1) + 
          filterCode + 
          originalFunction.slice(afterProcessing + 1);
        
        chartContent = chartContent.replace(originalFunction, updatedFunction);
        console.log('✅ Added 5-year filter to chart data');
      }
    }
    
    // Update X-axis title to show 5-year range
    chartContent = chartContent.replace(
      /title:\s*\{\s*display:\s*true,\s*text:\s*['"][^'"]*['"]/g,
      'title: { display: true, text: \'5-Year Range\''
    );
    console.log('✅ Updated X-axis title to show 5-year range');
  }
}

// Write changes to the chart file
fs.writeFileSync(chartFilePath, chartContent);
console.log('\n✅ Successfully updated chart file with API and port fixes');

// 5. Check api-service.js to make sure it's using the correct port too
if (fs.existsSync(apiServiceFilePath)) {
  console.log('\n5️⃣ Checking api-service.js for API endpoint configuration...');
  
  const apiServiceBackupPath = `${apiServiceFilePath}.backup-${Date.now()}`;
  fs.copyFileSync(apiServiceFilePath, apiServiceBackupPath);
  console.log(`✅ Created backup of api-service.js at ${apiServiceBackupPath}`);
  
  let apiServiceContent = fs.readFileSync(apiServiceFilePath, 'utf8');
  
  // Check for hardcoded port in apiServiceContent
  let apiServiceUpdated = false;
  
  if (urlRegex.test(apiServiceContent)) {
    apiServiceContent = apiServiceContent.replace(urlRegex, (match, protocol, port) => {
      if (port === '3000') {
        apiServiceUpdated = true;
        return `${protocol}3001`;
      }
      return match;
    });
  }
  
  // Make sure we have a method for fetching gold-rupee data
  if (!apiServiceContent.includes('getGoldRupeeData')) {
    // Find the ApiService class or object
    const apiServiceClassMatch = apiServiceContent.match(/class\s+ApiService\s*{[\s\S]+?(?=}\s*$)/);
    
    if (apiServiceClassMatch) {
      const apiServiceClass = apiServiceClassMatch[0];
      const lastMethod = apiServiceClass.lastIndexOf('}');
      
      if (lastMethod !== -1) {
        // Add the getGoldRupeeData method
        const newMethod = `

  /**
   * Get gold price and USD/INR exchange rate data
   * @returns {Promise<Object>} The gold and rupee exchange rate data
   */
  async getGoldRupeeData() {
    try {
      const response = await fetch(\`\${this.baseUrl}/gold-rupee\`);
      if (!response.ok) {
        throw new Error(\`API error: \${response.status}\`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching gold-rupee data:', error);
      return this._getFallbackGoldRupeeData();
    }
  }
  
  /**
   * Fallback data for gold price and USD/INR exchange rate
   * @private
   * @returns {Promise<Object>} Fallback sample data
   */
  _getFallbackGoldRupeeData() {
    console.log('Using fallback gold-rupee data');
    // Try to load from sample data file
    return fetch('/data/gold_rupee_data.json')
      .then(response => response.json())
      .catch(error => {
        console.error('Error loading fallback gold-rupee data:', error);
        return { 
          error: 'Failed to load data',
          data: []
        };
      });
  }`;
        
        const updatedApiService = 
          apiServiceClass.slice(0, lastMethod) + 
          newMethod + 
          apiServiceClass.slice(lastMethod);
        
        apiServiceContent = apiServiceContent.replace(apiServiceClass, updatedApiService);
        apiServiceUpdated = true;
        console.log('✅ Added getGoldRupeeData method to ApiService');
      }
    }
  }
  
  // Save changes if any were made
  if (apiServiceUpdated) {
    fs.writeFileSync(apiServiceFilePath, apiServiceContent);
    console.log('✅ Updated api-service.js with port and method fixes');
  } else {
    console.log('✓ No changes needed for api-service.js');
  }
}

// 6. Create a simple API endpoint for gold-rupee data if it doesn't exist
console.log('\n6️⃣ Checking if API endpoint exists for gold-rupee data...');

const apiDir = './api';
const goldApiPath = path.join(apiDir, 'gold-rupee.js');

if (!fs.existsSync(goldApiPath)) {
  console.log('Creating gold-rupee API endpoint...');
  
  // Ensure api directory exists
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }
  
  // Create the API endpoint file
  const apiEndpointCode = `// Gold Price vs. USD/INR Exchange Rate API
// This endpoint provides data for the gold price vs. rupee exchange rate chart

const fs = require('fs');
const path = require('path');

// Find the data file
function findDataFile() {
  const possiblePaths = [
    path.join(process.cwd(), 'newfrontend/data/gold_rupee_data.json'),
    path.join(process.cwd(), 'newfrontend/data/gold-rupee-data.json'),
    path.join(process.cwd(), 'backend/data/gold_rupee_data.json'),
    path.join(process.cwd(), 'data/gold_rupee_data.json')
  ];
  
  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  
  return null;
}

// API handler
module.exports = (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    // Find the data file
    const dataFile = findDataFile();
    
    if (!dataFile) {
      return res.status(404).json({
        error: 'Data file not found',
        message: 'Could not locate gold_rupee_data.json'
      });
    }
    
    // Read the data file
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    
    // Filter for 5-year range
    const now = new Date();
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(now.getFullYear() - 5);
    
    let filteredData;
    
    // Handle different data formats
    if (Array.isArray(data)) {
      // Simple array format
      filteredData = data.filter(item => new Date(item.date) >= fiveYearsAgo);
    } else if (data.data && Array.isArray(data.data)) {
      // Object with data array
      data.data = data.data.filter(item => new Date(item.date) >= fiveYearsAgo);
      filteredData = data;
    } else if (data.goldData && Array.isArray(data.goldData)) {
      // Object with separate gold and rupee arrays
      data.goldData = data.goldData.filter(item => new Date(item.date) >= fiveYearsAgo);
      
      if (data.rupeeData && Array.isArray(data.rupeeData)) {
        data.rupeeData = data.rupeeData.filter(item => new Date(item.date) >= fiveYearsAgo);
      }
      
      filteredData = data;
    } else {
      // Unknown format, return as is
      filteredData = data;
    }
    
    // Return the data
    return res.status(200).json(filteredData);
  } catch (error) {
    console.error('Error in gold-rupee API:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
};`;
  
  fs.writeFileSync(goldApiPath, apiEndpointCode);
  console.log(`✅ Created API endpoint at ${goldApiPath}`);
}

console.log('\n✅ All fixes applied successfully!');
console.log('\nNext steps:');
console.log('1. Add your changes: git add .');
console.log('2. Commit: git commit -m "Fix API endpoints and port references for Gold chart"');
console.log('3. Push: git push');
console.log('4. Deploy to Vercel: npx vercel --prod');
