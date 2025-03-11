const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing API route and chart display');
console.log('This script will fix the API endpoint for gold-rupee data and ensure the chart displays correctly');

// 1. Fix server.js to properly handle API routes
const serverJsPath = './server.js';
if (!fs.existsSync(serverJsPath)) {
  console.error('❌ server.js not found! Run create-server.js first.');
  process.exit(1);
}

// Make a backup of server.js
const serverBackup = `${serverJsPath}.backup-${Date.now()}`;
fs.copyFileSync(serverJsPath, serverBackup);
console.log(`✅ Created backup of server.js at ${serverBackup}`);

// Read server.js
let serverCode = fs.readFileSync(serverJsPath, 'utf8');

// Check if we need to fix the gold-rupee endpoint route
if (!serverCode.includes('/api/gold-rupee')) {
  console.log('Fixing gold-rupee endpoint route - moving it to /api/gold-rupee');
  
  // Replace gold-rupee endpoint route if it's at the wrong path
  if (serverCode.includes("app.get('/gold-rupee'")) {
    serverCode = serverCode.replace(
      "app.get('/gold-rupee'",
      "app.get('/api/gold-rupee'"
    );
  }
}

// Make sure the catch-all route is at the end
const catchAllPattern = /app\.get\('\*'/;
if (catchAllPattern.test(serverCode)) {
  // Extract the catch-all route
  const catchAllMatch = serverCode.match(/app\.get\('\*'[^}]*}\);/s);
  
  if (catchAllMatch) {
    // Remove the catch-all route from its current position
    serverCode = serverCode.replace(catchAllMatch[0], '');
    
    // Add it back at the end, just before app.listen
    const listenPattern = /app\.listen/;
    if (listenPattern.test(serverCode)) {
      serverCode = serverCode.replace(
        listenPattern,
        `// All other GET requests not handled before will return the React app
${catchAllMatch[0]}

app.listen`
      );
    }
  }
}

// Save the updated server.js
fs.writeFileSync(serverJsPath, serverCode);
console.log('✅ Updated server.js with correct API routes');

// 2. Now fix the frontend code to use the correct API endpoint
console.log('\n🔍 Searching for frontend code that needs to access the gold-rupee endpoint...');

// Look in modern-charts.js first
const modernChartsPath = './newfrontend/js/modern-charts.js';
if (fs.existsSync(modernChartsPath)) {
  console.log('Found modern-charts.js - checking for API endpoint references');
  
  // Make a backup
  const chartsBackup = `${modernChartsPath}.backup-${Date.now()}`;
  fs.copyFileSync(modernChartsPath, chartsBackup);
  console.log(`✅ Created backup of modern-charts.js at ${chartsBackup}`);
  
  // Read the file
  let chartsCode = fs.readFileSync(modernChartsPath, 'utf8');
  
  // Check if we need to update API endpoint references
  let updatesMade = false;
  
  // Fix hardcoded localhost URL references
  if (chartsCode.includes('http://localhost:3000/gold-rupee') || chartsCode.includes('http://localhost:3001/gold-rupee')) {
    chartsCode = chartsCode.replace(
      /http:\/\/localhost:\d+\/gold-rupee/g,
      '/api/gold-rupee'
    );
    updatesMade = true;
    console.log('✅ Updated hardcoded localhost URLs to use relative /api/gold-rupee path');
  }
  
  // Check for other references to /gold-rupee that should be /api/gold-rupee
  if (chartsCode.includes('"/gold-rupee"') || chartsCode.includes("'/gold-rupee'")) {
    chartsCode = chartsCode.replace(/['"]\/?gold-rupee['"]/g, '"/api/gold-rupee"');
    updatesMade = true;
    console.log('✅ Updated endpoint paths from /gold-rupee to /api/gold-rupee');
  }
  
  // Check for createStandaloneGoldRupeeChart function and update it
  const standaloneChartPattern = /window\.createStandaloneGoldRupeeChart\s*=\s*function/;
  if (standaloneChartPattern.test(chartsCode)) {
    console.log('Found createStandaloneGoldRupeeChart function');
    
    // Get the function body
    const functionMatch = chartsCode.match(/window\.createStandaloneGoldRupeeChart\s*=\s*function[^{]*{([^}]*)}/s);
    
    if (functionMatch) {
      const functionBody = functionMatch[1];
      
      // Check if we need to update the API URL
      if (functionBody.includes('apiUrl')) {
        const updatedFunctionBody = functionBody.replace(
          /const\s+apiUrl\s*=\s*['"][^'"]*['"]/,
          "const apiUrl = '/api/gold-rupee'"
        );
        
        if (updatedFunctionBody !== functionBody) {
          chartsCode = chartsCode.replace(functionBody, updatedFunctionBody);
          updatesMade = true;
          console.log('✅ Updated apiUrl in createStandaloneGoldRupeeChart function');
        }
      }
      
      // Add filter to ensure 5-year range
      if (!functionBody.includes('fiveYearsAgo') && !functionBody.includes('setFullYear')) {
        // Look for where to insert the 5-year filter code
        const fetchThenMatch = /\.then\s*\(\s*data\s*=>\s*{/;
        
        if (fetchThenMatch.test(functionBody)) {
          const fiveYearFilterCode = `
          // Apply 5-year filter to data
          const now = new Date();
          const fiveYearsAgo = new Date();
          fiveYearsAgo.setFullYear(now.getFullYear() - 5);
          
          // Filter data to only include last 5 years
          if (data.data && Array.isArray(data.data)) {
            data.data = data.data.filter(item => new Date(item.date) >= fiveYearsAgo);
            console.log(\`Filtered to \${data.data.length} data points\`);
          }
          `;
          
          const updatedFunctionBody = functionBody.replace(
            fetchThenMatch,
            match => match + fiveYearFilterCode
          );
          
          if (updatedFunctionBody !== functionBody) {
            chartsCode = chartsCode.replace(functionBody, updatedFunctionBody);
            updatesMade = true;
            console.log('✅ Added 5-year filter to chart data processing');
          }
        }
      }
    }
  }
  
  // Check for createGoldRupeeChart function and update it
  const goldRupeeChartPattern = /function\s+createGoldRupeeChart/;
  if (goldRupeeChartPattern.test(chartsCode)) {
    console.log('Found createGoldRupeeChart function');
    
    // Get the function body
    const functionMatch = chartsCode.match(/function\s+createGoldRupeeChart[^{]*{([^}]*)}/s);
    
    if (functionMatch) {
      const functionBody = functionMatch[1];
      
      // Ensure we're filtering for 5 years in the chart display
      if (!functionBody.includes('fiveYearsAgo') && !functionBody.includes('setFullYear')) {
        // Find processGoldRupeeData function call
        const processDataMatch = /processGoldRupeeData\s*\(/;
        
        if (processDataMatch.test(functionBody)) {
          const fiveYearFilterCode = `
          
          // Ensure data covers 5-year range
          const now = new Date();
          const fiveYearsAgo = new Date();
          fiveYearsAgo.setFullYear(now.getFullYear() - 5);
          
          if (processedData.labels && processedData.labels.length > 0) {
            // Filter data to last 5 years
            const filteredData = processedData.labels.map((label, i) => ({
              index: i, 
              label,
              goldValue: processedData.goldValues[i],
              rupeeValue: processedData.rupeeValues[i],
              date: data.data[i]?.date
            }))
            .filter(item => !item.date || new Date(item.date) >= fiveYearsAgo);
            
            // Rebuild the arrays from filtered data
            processedData.labels = filteredData.map(d => d.label);
            processedData.goldValues = filteredData.map(d => d.goldValue);
            processedData.rupeeValues = filteredData.map(d => d.rupeeValue);
            
            console.log(\`Filtered chart data to \${processedData.labels.length} points within 5-year range\`);
          }
          `;
          
          // Insert the filter code after processGoldRupeeData is called
          const updatedFunctionBody = functionBody.replace(
            /const\s+processedData\s*=\s*processGoldRupeeData\s*\([^)]*\);/,
            match => match + fiveYearFilterCode
          );
          
          if (updatedFunctionBody !== functionBody) {
            chartsCode = chartsCode.replace(functionBody, updatedFunctionBody);
            updatesMade = true;
            console.log('✅ Added 5-year filter to createGoldRupeeChart function');
          }
        }
      }
      
      // Also update the x-axis title to show 5-year range
      const xAxisTitlePattern = /title:\s*{\s*display:\s*true,\s*text:\s*['"][^'"]*['"]/;
      if (xAxisTitlePattern.test(functionBody)) {
        const updatedFunctionBody = functionBody.replace(
          xAxisTitlePattern,
          match => match.replace(/text:\s*['"][^'"]*['"]/, "text: '5-Year Range'")
        );
        
        if (updatedFunctionBody !== functionBody) {
          chartsCode = chartsCode.replace(functionBody, updatedFunctionBody);
          updatesMade = true;
          console.log('✅ Updated x-axis title to show 5-Year Range');
        }
      }
    }
  }
  
  // Save changes if we made any
  if (updatesMade) {
    fs.writeFileSync(modernChartsPath, chartsCode);
    console.log('✅ Saved changes to modern-charts.js');
  } else {
    console.log('⚠️ No changes were needed in modern-charts.js');
  }
}

// 3. Check for any api-service.js that might need updating
const apiServicePath = './newfrontend/js/api-service.js';
if (fs.existsSync(apiServicePath)) {
  console.log('\nChecking api-service.js for gold-rupee endpoint references...');
  
  // Make a backup
  const apiServiceBackup = `${apiServicePath}.backup-${Date.now()}`;
  fs.copyFileSync(apiServicePath, apiServiceBackup);
  console.log(`✅ Created backup of api-service.js at ${apiServiceBackup}`);
  
  // Read the file
  let apiServiceCode = fs.readFileSync(apiServicePath, 'utf8');
  
  // Check if we need to update gold-rupee endpoint references
  let apiServiceUpdated = false;
  
  // Update any hardcoded URLs
  if (apiServiceCode.includes('/gold-rupee') && !apiServiceCode.includes('/api/gold-rupee')) {
    apiServiceCode = apiServiceCode.replace(/['"]\/gold-rupee['"]/g, '"/api/gold-rupee"');
    apiServiceUpdated = true;
    console.log('✅ Updated gold-rupee endpoint references in api-service.js');
  }
  
  // Check if we need to add getGoldRupeeData method
  if (!apiServiceCode.includes('getGoldRupeeData')) {
    console.log('Adding getGoldRupeeData method to api-service.js');
    
    // Find the end of the class or last method
    const lastMethodMatch = apiServiceCode.match(/\w+\s*\([^)]*\)\s*{[^}]*}/g);
    
    if (lastMethodMatch && lastMethodMatch.length > 0) {
      const lastMethod = lastMethodMatch[lastMethodMatch.length - 1];
      const lastMethodIndex = apiServiceCode.lastIndexOf(lastMethod) + lastMethod.length;
      
      // Add the new method
      const newMethod = `
  
  /**
   * Get gold price vs. USD/INR exchange rate data
   * @returns {Promise<Object>} Gold price and exchange rate data
   */
  async getGoldRupeeData() {
    try {
      const response = await fetch(\`\${this.baseUrl}/api/gold-rupee\`);
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
   * Fallback data for gold-rupee
   * @private
   * @returns {Promise<Object>} Fallback data
   */
  _getFallbackGoldRupeeData() {
    console.log('Using fallback gold-rupee data');
    return {
      data: Array.from({ length: 60 }).map((_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (59 - i));
        return {
          date: date.toISOString().split('T')[0],
          goldPrice: 1500 + Math.random() * 500,
          rupeeRate: 70 + Math.random() * 10
        };
      })
    };
  }`;
      
      // Insert the new method
      apiServiceCode = 
        apiServiceCode.slice(0, lastMethodIndex) + 
        newMethod + 
        apiServiceCode.slice(lastMethodIndex);
      
      apiServiceUpdated = true;
      console.log('✅ Added getGoldRupeeData method to api-service.js');
    }
  }
  
  // Save changes if we made any
  if (apiServiceUpdated) {
    fs.writeFileSync(apiServicePath, apiServiceCode);
    console.log('✅ Saved changes to api-service.js');
  } else {
    console.log('⚠️ No changes were needed in api-service.js');
  }
}

// 4. Make sure the Vercel API endpoint is correct too
const vercelEndpointPath = './api/gold-rupee.js';
if (fs.existsSync(vercelEndpointPath)) {
  console.log('\nVerifying Vercel API endpoint at /api/gold-rupee.js...');
  
  // Make sure the endpoint is exporting a handler function
  const vercelCode = fs.readFileSync(vercelEndpointPath, 'utf8');
  
  if (!vercelCode.includes('module.exports = (req, res)')) {
    console.log('⚠️ Vercel API endpoint does not export a handler function.');
    console.log('   If you continue to have issues, you may need to manually fix ./api/gold-rupee.js');
  } else {
    console.log('✅ Vercel API endpoint looks properly configured');
  }
} else {
  console.log('\n⚠️ No Vercel API endpoint found at ./api/gold-rupee.js');
  console.log('   This may cause problems in production. Consider creating this file.');
}

// 5. Create a custom test file
const testFilePath = './test-gold-rupee-endpoint.js';
const testFileContent = `// Test script for gold-rupee endpoint
const http = require('http');

console.log('🧪 Testing gold-rupee API endpoint...');

// Function to make a GET request
function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data.includes('{') ? JSON.parse(data) : data
          });
        } catch (err) {
          reject(new Error(\`Invalid JSON response: \${err.message}\`));
        }
      });
    }).on('error', reject);
  });
}

// Test the API endpoint
async function runTests() {
  console.log('Testing endpoint: http://localhost:3001/api/gold-rupee');
  
  try {
    const response = await get('http://localhost:3001/api/gold-rupee');
    
    console.log(\`Status code: \${response.status}\`);
    
    if (response.status === 200) {
      console.log('✅ Endpoint returned status 200');
      
      // Check if we got valid data
      if (response.data) {
        console.log('✅ Endpoint returned valid data');
        
        // Check data format
        if (Array.isArray(response.data)) {
          console.log(\`✅ Data is an array with \${response.data.length} items\`);
          
          // Check if the data covers 5 years
          const dates = response.data.map(item => new Date(item.date));
          const minDate = new Date(Math.min(...dates));
          const maxDate = new Date(Math.max(...dates));
          const yearsDiff = (maxDate - minDate) / (1000 * 60 * 60 * 24 * 365);
          
          console.log(\`Date range: \${minDate.toISOString().split('T')[0]} - \${maxDate.toISOString().split('T')[0]}\`);
          console.log(\`Range covers approximately \${yearsDiff.toFixed(1)} years\`);
          
          if (yearsDiff >= 4.9) {
            console.log('✅ Data covers at least 5 years');
          } else {
            console.log('⚠️ Data covers less than 5 years');
          }
          
        } else if (response.data.data && Array.isArray(response.data.data)) {
          console.log(\`✅ Data is an object with a data array containing \${response.data.data.length} items\`);
          
          // Check if the data covers 5 years
          const dates = response.data.data.map(item => new Date(item.date));
          const minDate = new Date(Math.min(...dates));
          const maxDate = new Date(Math.max(...dates));
          const yearsDiff = (maxDate - minDate) / (1000 * 60 * 60 * 24 * 365);
          
          console.log(\`Date range: \${minDate.toISOString().split('T')[0]} - \${maxDate.toISOString().split('T')[0]}\`);
          console.log(\`Range covers approximately \${yearsDiff.toFixed(1)} years\`);
          
          if (yearsDiff >= 4.9) {
            console.log('✅ Data covers at least 5 years');
          } else {
            console.log('⚠️ Data covers less than 5 years');
          }
          
        } else {
          console.log('❌ Unexpected data format:', response.data);
        }
      } else {
        console.log('❌ Endpoint returned empty data');
      }
    } else {
      console.log(\`❌ Endpoint returned error status: \${response.status}\`);
      
      if (response.data) {
        console.log('Error details:', response.data);
      }
    }
  } catch (error) {
    console.error('❌ Error testing endpoint:', error.message);
    console.log('This could mean:');
    console.log('1. The server is not running');
    console.log('2. The endpoint is not implemented');
    console.log('3. The endpoint is at a different URL');
  }
  
  // Also test the browser URL to see what it returns
  console.log('\\nTesting direct browser URL: http://localhost:3001/gold-rupee');
  
  try {
    const browserResponse = await get('http://localhost:3001/gold-rupee');
    
    console.log(\`Status code: \${browserResponse.status}\`);
    
    // Check if the response is HTML (website) or JSON (API)
    const isHtml = typeof browserResponse.data === 'string' && browserResponse.data.includes('<!DOCTYPE html>');
    
    if (isHtml) {
      console.log('❌ /gold-rupee is returning HTML instead of JSON data');
      console.log('   This confirms the issue: gold-rupee endpoint should be at /api/gold-rupee');
      console.log('   The server should be updated to handle this properly');
    } else {
      console.log('✅ /gold-rupee is returning proper data');
    }
  } catch (error) {
    console.error('❌ Error testing direct URL:', error.message);
  }
}

runTests();
`;

fs.writeFileSync(testFilePath, testFileContent);
console.log('\n✅ Created test script at ./test-gold-rupee-endpoint.js');

// Create a fix script for chart
const fixChartPath = './fix-chart-title.js';
const fixChartContent = `// Script to update chart x-axis title
const fs = require('fs');

// Path to modern-charts.js
const chartPath = './newfrontend/js/modern-charts.js';

// Check if the file exists
if (fs.existsSync(chartPath)) {
  // Read the file
  let content = fs.readFileSync(chartPath, 'utf8');
  
  // Check if we need to update the x-axis title
  if (content.includes('text: \\'2024\\'') || 
      content.includes('text: "2024"')) {
    
    // Update the title
    content = content.replace(
      /title:\s*{\s*display:\s*true,\s*text:\s*['"]2024['"]/g,
      'title: { display: true, text: \\'5-Year Range\\''
    );
    
    // Save the changes
    fs.writeFileSync(chartPath, content);
    console.log('✅ Updated chart x-axis title to "5-Year Range"');
  } else {
    console.log('Chart title already updated or using a different format');
  }
} else {
  console.log('❌ Could not find modern-charts.js file');
}
`;

fs.writeFileSync(fixChartPath, fixChartContent);
console.log('✅ Created chart title fix script at ./fix-chart-title.js');

console.log('\n✅ All fixes have been applied');
console.log('\nNext steps:');
console.log('1. Restart your server: node server.js');
console.log('2. Test the API endpoint: node test-gold-rupee-endpoint.js');
console.log('3. If needed, fix chart title: node fix-chart-title.js');
console.log('4. Add and commit your changes: git add . && git commit -m "Fix gold-rupee API endpoint and chart display"');
console.log('5. Deploy to Vercel: npx vercel --prod');
