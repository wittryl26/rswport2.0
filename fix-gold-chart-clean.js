const fs = require('fs');

console.log('🔍 Fixing Gold vs USD/INR Chart in modern-charts.js file');

// Directly target the file we now know contains the chart code
const chartFilePath = './newfrontend/js/modern-charts.js';

// Check if the file exists
if (!fs.existsSync(chartFilePath)) {
  console.error(`❌ File not found: ${chartFilePath}`);
  process.exit(1);
}

// Create a backup before making changes
const backupPath = `${chartFilePath}.backup-${Date.now()}`;
fs.copyFileSync(chartFilePath, backupPath);
console.log(`✅ Created backup at ${backupPath}`);

// Read the file content
let content = fs.readFileSync(chartFilePath, 'utf8');

console.log('\n1️⃣ Looking for the Gold Rupee Chart function...');

// Look for the specific createGoldRupeeChart function
const functionMatch = content.match(/function\s+createGoldRupeeChart\s*\([^)]*\)\s*\{[\s\S]+?(?=function|\}$)/);

if (!functionMatch) {
  console.error('❌ Could not find createGoldRupeeChart function in the file');
  process.exit(1);
}

console.log('✅ Found createGoldRupeeChart function');

// Extract the function
const origFunction = functionMatch[0];
let modifiedFunction = origFunction;

// Make modifications to show 5-year range
console.log('\n2️⃣ Modifying the chart to display 5-year range...');

// Target fixes for specific sections:

// 1. Update x-axis title to indicate 5-year range instead of just current year
modifiedFunction = modifiedFunction.replace(
  /title:\s*\{\s*display:\s*true,\s*text:\s*['"]2024['"]/g, 
  'title: { display: true, text: \'5-Year Range\''
);

// 2. Modify any data processing or filtering logic
const processingUpdates = [
  {
    pattern: /sort\(\(a,\s*b\)\s*=>\s*new\s*Date\(a\.date\)\s*-\s*new\s*Date\(b\.date\)\)/g, 
    replace: (match) => {
      return match + `
        // Ensure we filter to keep only the past 5 years of data
        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
        data = data.filter(item => new Date(item.date) >= fiveYearsAgo);`;
    }
  },
  {
    // Look for options section to modify time scale
    pattern: /scales:\s*\{([\s\S]*?)x:\s*\{([\s\S]*?)\}/g,
    replace: (match, scales, xAxis) => {
      // Check if there's a time property in the x-axis configuration
      if (xAxis.includes('time')) {
        // Update time unit to show better scale for 5 years
        return match.replace(
          /time:\s*\{([\s\S]*?)\}/g,
          'time: { unit: \'month\', distribution: \'linear\', displayFormats: { month: \'MMM yyyy\' } }'
        );
      } 
      return match;
    }
  }
];

processingUpdates.forEach(({ pattern, replace }) => {
  if (pattern.test(modifiedFunction)) {
    modifiedFunction = modifiedFunction.replace(pattern, replace);
  }
});

// 3. Check for data filtering that might be limiting the date range
if (modifiedFunction.includes('filter') && 
    (modifiedFunction.includes('date') || modifiedFunction.includes('Date')) && 
    modifiedFunction.includes('getFullYear')) {
  
  console.log('Found date filtering code, ensuring it uses 5-year range...');
  
  // Look for date filter that might be restricting range
  modifiedFunction = modifiedFunction.replace(
    /setFullYear\([^)]*getFullYear\(\)\s*-\s*(\d+)[^)]*\)/g,
    (match, yearValue) => {
      if (parseInt(yearValue) < 5) {
        return match.replace(yearValue, '5');
      }
      return match;
    }
  );
}

// If no date filter was found, add one
if (!modifiedFunction.includes('setFullYear') || !modifiedFunction.includes('getFullYear() - 5')) {
  console.log('Adding 5-year filter to data processing...');
  
  // Find a good spot to insert the filter - after data loading but before chart creation
  const dataProcessingPoint = modifiedFunction.indexOf('processGoldRupeeData');
  
  if (dataProcessingPoint !== -1) {
    // Find the end of this statement or block
    const insertionPoint = modifiedFunction.indexOf(';', dataProcessingPoint);
    
    if (insertionPoint !== -1) {
      // Add filtering code after data processing
      const filterCode = `
        
        // Ensure data covers 5-year range
        const now = new Date();
        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(now.getFullYear() - 5);
        
        // Apply 5-year filter if we have dates
        if (processedData.labels.length > 0) {
          // Filter data points to last 5 years
          const filteredIndices = processedData.labels.map((_, index) => index)
            .filter(index => {
              const date = new Date(data.data[index].date);
              return date >= fiveYearsAgo;
            });
          
          // Only keep data within 5-year range
          processedData.labels = filteredIndices.map(i => processedData.labels[i]);
          processedData.goldValues = filteredIndices.map(i => processedData.goldValues[i]);
          processedData.rupeeValues = filteredIndices.map(i => processedData.rupeeValues[i]);
        }`;
      
      // Insert the filtering code
      modifiedFunction = 
        modifiedFunction.substring(0, insertionPoint + 1) + 
        filterCode + 
        modifiedFunction.substring(insertionPoint + 1);
    }
  }
}

// Apply the modified function to the main content
const updatedContent = content.replace(origFunction, modifiedFunction);

// Save the changes
fs.writeFileSync(chartFilePath, updatedContent);
console.log(`\n✅ Successfully updated 5-year chart range in ${chartFilePath}`);

// Create restore script to revert changes if needed
const restoreScript = `// Simple script to restore original file
const fs = require('fs');
try {
  fs.copyFileSync('${backupPath}', '${chartFilePath}');
  console.log('Successfully restored file from backup');
} catch (err) {
  console.error('Error restoring file:', err.message);
}`;

fs.writeFileSync('./restore-gold-chart.js', restoreScript);
console.log('✅ Created restore script (restore-gold-chart.js)');

// Print next steps
console.log('\nNext steps:');
console.log('1. Commit your changes: git add .');
console.log('2. Commit: git commit -m "Fix Gold Price vs. USD/INR chart to show 5-year data range"');
console.log('3. Push: git push');
console.log('4. Deploy to Vercel: npx vercel --prod');
