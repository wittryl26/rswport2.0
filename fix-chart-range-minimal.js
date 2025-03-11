const fs = require('fs');
const path = require('path');

console.log('🔧 Minimal Chart Fix Tool - For Gold Price vs USD/INR Chart');
console.log('This will make targeted changes to fix the x-axis range without breaking the site');

// Check if the econ-data.js exists in newfrontend
const chartPath = './newfrontend/js/econ-data.js';

// First create a backup if it doesn't already exist
if (fs.existsSync(chartPath)) {
  const backupPath = `${chartPath}.backup-${Date.now()}`;
  fs.copyFileSync(chartPath, backupPath);
  console.log(`✅ Created backup of econ-data.js at ${backupPath}`);

  // Read the file content
  let content = fs.readFileSync(chartPath, 'utf8');
  const originalContent = content;
  
  // Look for the gold-rupee chart creation function
  console.log('\n🔍 Analyzing chart code...');
  
  // Find the chart function that handles gold price and rupee data
  const goldChartFunctions = [
    { pattern: /function\s+createGoldRupeeChart/i, name: 'createGoldRupeeChart' },
    { pattern: /function\s+createGoldExchangeRateChart/i, name: 'createGoldExchangeRateChart' },
    { pattern: /const\s+createGoldPriceChart/i, name: 'createGoldPriceChart' },
    { pattern: /function\s+createGoldChart/i, name: 'createGoldChart' }
  ];
  
  let foundChartFunction = null;
  for (const func of goldChartFunctions) {
    if (func.pattern.test(content)) {
      foundChartFunction = func.name;
      console.log(`Found chart function: ${foundChartFunction}`);
      break;
    }
  }
  
  if (!foundChartFunction) {
    console.log('Could not find specific gold chart function.');
    console.log('Looking for any function that processes gold data...');
    
    if (content.toLowerCase().includes('gold') && content.toLowerCase().includes('chart') &&
        content.toLowerCase().includes('data')) {
      console.log('Found general chart code with gold data references');
    } else {
      console.log('❌ Could not find gold chart code in econ-data.js');
      process.exit(1);
    }
  }
  
  // Make specific, targeted changes to fix the chart range
  let modified = false;
  
  console.log('\n🔧 Looking for date range or filter patterns to fix...');
  
  // 1. Update year range parameters
  const yearRangePatterns = [
    { 
      pattern: /const\s+yearRange\s*=\s*(\d+)/g,
      fix: (match, year) => {
        return match.replace(year, '5');
      }
    },
    { 
      pattern: /let\s+yearRange\s*=\s*(\d+)/g,
      fix: (match, year) => {
        return match.replace(year, '5');
      }
    },
    { 
      pattern: /years\s*[:=]\s*(\d+)/g,
      fix: (match, year) => {
        return match.replace(year, '5');
      }
    },
    { 
      pattern: /\.setFullYear\(.*getFullYear\(\)\s*-\s*(\d+)\)/g,
      fix: (match, year) => {
        return match.replace(year, '5');
      }
    },
    { 
      pattern: /startDate\.setFullYear\(endDate\.getFullYear\(\)\s*-\s*(\d+)\)/g,
      fix: (match, year) => {
        return match.replace(year, '5');
      }
    }
  ];

  yearRangePatterns.forEach(({ pattern, fix }) => {
    if (pattern.test(content)) {
      // Reset lastIndex before using regex for replacement
      pattern.lastIndex = 0;
      
      // Find all matches and apply fixes
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const yearValue = match[1];
        if (parseInt(yearValue) < 5) {
          console.log(`Found year range setting: ${match[0]}`);
          const updated = fix(match[0], yearValue);
          content = content.replace(match[0], updated);
          console.log(`✅ Updated to: ${updated}`);
          modified = true;
        }
      }
    }
  });
  
  // 2. Fix date filtering that might limit the range
  if (content.includes('filter') && 
      (content.includes('date') || content.includes('Date')) &&
      content.includes('getFullYear')) {
    
    console.log('Found date filtering code. Looking for filtering patterns...');
    
    // Common date filtering patterns
    const dateFilterPatterns = [
      {
        pattern: /\.filter\(\s*([^=]+)\s*=>\s*new\s+Date\(\s*([^)]+)\.date\s*\)\s*>\s*startDate\s*\)/g,
        fix: (match) => {
          console.log(`Found date filter: ${match}`);
          const fixedFilter = '/* Date range expanded to 5 years */ .filter(item => { ' +
            'const itemDate = new Date(item.date); ' +
            'const startDate = new Date(); ' +
            'startDate.setFullYear(startDate.getFullYear() - 5); ' +
            'return itemDate >= startDate; ' + 
            '})';
          return fixedFilter;
        }
      },
      {
        pattern: /\.filter\(\s*([^=]+)\s*=>\s*{\s*(?:const|let|var)\s+itemDate[^;]+;\s*return\s+itemDate\s*>=\s*startDate/g,
        fix: (match) => {
          console.log(`Found complex date filter: ${match}`);
          const fixedCode = match.replace(/startDate\s*=\s*new\s+Date[^;]+;/, 
            'startDate = new Date(); startDate.setFullYear(startDate.getFullYear() - 5);');
          return fixedCode;
        }
      }
    ];
    
    dateFilterPatterns.forEach(({ pattern, fix }) => {
      if (pattern.test(content)) {
        // Create a fixed version
        content = content.replace(pattern, fix);
        modified = true;
      }
    });
  }
  
  // 3. Check for time period settings in Chart.js options
  if (content.includes('Chart') && content.includes('options')) {
    console.log('Checking Chart.js options for time settings...');
    
    const timeScalePatterns = [
      {
        pattern: /time\s*:\s*{\s*unit\s*:\s*['"]([^'"]+)['"]/g,
        fix: (match, unit) => {
          if (unit === 'month' || unit === 'day') {
            console.log(`Found time unit: ${unit}, keeping as is for detail`);
            return match;
          } else {
            console.log(`Found time unit: ${unit}, updating to 'month'`);
            return match.replace(unit, 'month');
          }
        }
      },
      {
        pattern: /time\s*:\s*{\s*unitStepSize\s*:\s*(\d+)/g,
        fix: (match, step) => {
          const newStep = parseInt(step) > 6 ? 6 : step; // Limit to reasonable step size
          return match.replace(step, newStep);
        }
      }
    ];
    
    timeScalePatterns.forEach(({ pattern, fix }) => {
      if (pattern.test(content)) {
        // Reset before using
        pattern.lastIndex = 0;
        
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const updated = fix(match[0], match[1]);
          content = content.replace(match[0], updated);
          modified = true;
        }
      }
    });
  }
  
  // 4. Increase displayed data points
  const dataLimitPatterns = [
    {
      pattern: /\.slice\(0,\s*(\d+)\)/g,
      fix: (match, limit) => {
        const newLimit = Math.max(60, parseInt(limit)); // At least 60 data points (5 years of monthly data)
        return match.replace(limit, newLimit);
      }
    },
    {
      pattern: /\.slice\(-(\d+)\)/g,
      fix: (match, limit) => {
        const newLimit = Math.max(60, parseInt(limit)); // At least 60 data points
        return match.replace(limit, newLimit);
      }
    }
  ];
  
  dataLimitPatterns.forEach(({ pattern, fix }) => {
    if (pattern.test(content)) {
      pattern.lastIndex = 0;
      
      let match;
      while ((match = pattern.exec(content)) !== null) {
        console.log(`Found data limiting: ${match[0]}`);
        const updated = fix(match[0], match[1]);
        content = content.replace(match[0], updated);
        console.log(`✅ Updated to: ${updated}`);
        modified = true;
      }
    }
  });
  
  // Add explicit 5-year chart configuration if we couldn't find anything to modify
  if (!modified) {
    console.log('Could not find specific patterns to modify. Adding explicit 5-year range configuration...');
    
    // Look for the chart creation or data loading section
    let insertPoint = -1;
    
    // Common pattern where we should insert our code
    const insertionPatterns = [
      { pattern: /(?:const|let|var)\s+data\s*=\s*response\.json\(\)/, insertBefore: false },
      { pattern: /fetch\([^)]+\)\s*\.\s*then/, insertBefore: false },
      { pattern: /new\s+Chart\(/, insertBefore: true }
    ];
    
    for (const p of insertionPatterns) {
      insertPoint = content.search(p.pattern);
      if (insertPoint !== -1) {
        // Find the beginning of the line
        const lineStart = content.lastIndexOf('\n', insertPoint) + 1;
        
        // Calculate indentation
        const indentMatch = content.substring(lineStart, insertPoint).match(/^\s+/);
        const indent = indentMatch ? indentMatch[0] : '';
        
        // Create code to insert
        let codeToInsert;
        if (p.insertBefore) {
          codeToInsert = `
${indent}// Ensure 5-year range for chart data
${indent}const ensureFiveYearRange = (data) => {
${indent}  if (!Array.isArray(data) || data.length === 0) return data;
${indent}  // Calculate 5 years ago
${indent}  const now = new Date();
${indent}  const fiveYearsAgo = new Date();
${indent}  fiveYearsAgo.setFullYear(now.getFullYear() - 5);
${indent}  // Filter data to ensure 5-year range
${indent}  return data.filter(item => {
${indent}    if (!item.date) return true;
${indent}    const date = new Date(item.date);
${indent}    return date >= fiveYearsAgo;
${indent}  });
${indent}}
`;
        } else {
          codeToInsert = `
${indent}// Ensure we display 5 years of data
${indent}if (Array.isArray(data)) {
${indent}  const now = new Date();
${indent}  const fiveYearsAgo = new Date();
${indent}  fiveYearsAgo.setFullYear(now.getFullYear() - 5);
${indent}  data = data.filter(item => {
${indent}    if (!item.date) return true;
${indent}    const date = new Date(item.date);
${indent}    return date >= fiveYearsAgo;
${indent}  });
${indent}}
`;
        }
        
        // Insert the code
        const newContent = content.substring(0, p.insertBefore ? insertPoint : content.indexOf('\n', insertPoint) + 1) +
                         codeToInsert +
                         content.substring(p.insertBefore ? insertPoint : content.indexOf('\n', insertPoint) + 1);
        
        content = newContent;
        modified = true;
        console.log('✅ Added explicit 5-year range filter code');
        break;
      }
    }
  }
  
  // Save changes if we made any
  if (modified) {
    fs.writeFileSync(chartPath, content);
    console.log('\n✅ Successfully updated econ-data.js with 5-year chart range fixes');
    
    // Create a simple restore script
    const restoreScript = `// Simple script to restore original econ-data.js
const fs = require('fs');
try {
  fs.copyFileSync('${backupPath}', '${chartPath}');
  console.log('Successfully restored econ-data.js from backup');
} catch (err) {
  console.error('Error restoring file:', err.message);
}`;
    
    fs.writeFileSync('./restore-econ-data.js', restoreScript);
    console.log('✅ Created restore script (restore-econ-data.js) in case you need to revert changes');
  } else {
    console.log('\n⚠️ No changes were made to econ-data.js');
  }

} else {
  console.log(`❌ Could not find econ-data.js at ${chartPath}`);
}

console.log('\nNext steps:');
console.log('1. Add your changes: git add .');
console.log('2. Commit: git commit -m "Fix chart range to show 5 years of data"');
console.log('3. Push: git push');
console.log('4. Deploy to Vercel: npx vercel --prod');
