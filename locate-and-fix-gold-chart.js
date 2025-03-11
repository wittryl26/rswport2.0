const fs = require('fs');
const path = require('path');

console.log('🔍 Locating and fixing Gold vs USD/INR Chart x-axis range');

// Define possible locations for chart-related files
const possibleLocations = [
  './newfrontend/js/econ-data.js',
  './newfrontend/js/financial.js',
  './newfrontend/js/api-service.js',
  './newfrontend/js/chart-renderer-fix.js',
  './newfrontend/js/modern-charts.js',
  './newfrontend/js/emergency-chart.js',
  './Frontend/js/econ-data.js',
  './Frontend/js/financial.js',
  './api/gold-inr-data.js'
];

// Define keywords to look for
const goldKeywords = ['gold', 'price', 'rupee', 'inr', 'exchange rate', 'usd'];
const chartKeywords = ['chart', 'getContext', 'new Chart', 'createChart', 'renderChart', 'drawChart'];
const dateKeywords = ['setFullYear', 'getFullYear', 'startDate', 'endDate', 'date range', 'filter'];

// Function to score a file based on keyword matches
function scoreFile(content, keywords) {
  return keywords.reduce((score, keyword) => {
    // Count occurrences of keyword (case insensitive)
    const matches = (content.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
    return score + matches;
  }, 0);
}

// Find the most likely file containing our chart
console.log('\n1️⃣ Searching for the file containing Gold vs. USD/INR chart code...');

let bestFile = null;
let bestScore = 0;
let bestContent = null;
let analysisResults = [];

possibleLocations.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Calculate scores for each type of keyword
      const goldScore = scoreFile(content, goldKeywords);
      const chartScore = scoreFile(content, chartKeywords);
      const dateScore = scoreFile(content, dateKeywords);
      const totalScore = goldScore * 2 + chartScore + dateScore; // Gold keywords weighted higher
      
      analysisResults.push({
        filePath,
        goldScore, 
        chartScore,
        dateScore,
        totalScore
      });
      
      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestFile = filePath;
        bestContent = content;
      }
    } catch (err) {
      console.log(`Error reading ${filePath}: ${err.message}`);
    }
  }
});

// Sort and show analysis results
analysisResults.sort((a, b) => b.totalScore - a.totalScore);
console.log('\nFiles analyzed (ranked by relevance):');
analysisResults.forEach(result => {
  console.log(`- ${result.filePath}: Score ${result.totalScore} (Gold: ${result.goldScore}, Chart: ${result.chartScore}, Date: ${result.dateScore})`);
});

if (!bestFile) {
  console.error('\n❌ Could not find any chart-related files');
  process.exit(1);
}

console.log(`\n✅ Most likely file containing Gold chart: ${bestFile}`);

// Make a backup of the selected file
const backupPath = `${bestFile}.backup-${Date.now()}`;
fs.copyFileSync(bestFile, backupPath);
console.log(`✅ Created backup at ${backupPath}`);

// Analyze the content to find the specific chart function
console.log('\n2️⃣ Analyzing chart code to locate Gold vs. USD/INR chart...');

// Look for chart creation functions
const chartFunctionPatterns = [
  { pattern: /function\s+(\w+GoldRupee\w*Chart)/i, type: 'function declaration' },
  { pattern: /function\s+(\w+Gold\w*Chart)/i, type: 'function declaration' },
  { pattern: /function\s+(\w+Price\w*Chart)/i, type: 'function declaration' },
  { pattern: /function\s+(\w+Exchange\w*Chart)/i, type: 'function declaration' },
  { pattern: /function\s+(\w+Render\w*Chart)/i, type: 'function declaration' },
  { pattern: /function\s+(\w+Create\w*Chart)/i, type: 'function declaration' },
  { pattern: /const\s+(\w+GoldRupee\w*Chart)\s*=/i, type: 'const function' },
  { pattern: /const\s+(\w+Gold\w*Chart)\s*=/i, type: 'const function' },
  { pattern: /const\s+(\w+Price\w*Chart)\s*=/i, type: 'const function' },
  { pattern: /async\s+function\s+(\w+Gold\w*)/i, type: 'async function' },
  { pattern: /async\s+function\s+(\w+Chart\w*)/i, type: 'async function' },
  { pattern: /function\s+create(\w+)Chart/i, type: 'create chart function' },
  { pattern: /function\s+render(\w+)Chart/i, type: 'render chart function' }
];

// Search for chart title or labels related to gold
const chartTitlePatterns = [
  { pattern: /title:\s*['"`](.*gold.*rupee|.*gold.*inr|.*gold.*exchange|.*gold.*price)['"`]/i, type: 'chart title' },
  { pattern: /title:\s*['"`](.*rupee.*gold|.*inr.*gold|.*exchange.*gold|.*price.*gold)['"`]/i, type: 'chart title' },
  { pattern: /label:\s*['"`](.*gold.*rupee|.*gold.*inr|.*gold.*exchange|.*gold.*price)['"`]/i, type: 'data label' },
  { pattern: /label:\s*['"`](.*rupee.*gold|.*inr.*gold|.*exchange.*gold|.*price.*gold)['"`]/i, type: 'data label' }
];

// Find potential chart functions
const foundFunctions = [];
chartFunctionPatterns.forEach(({ pattern, type }) => {
  let match;
  pattern.lastIndex = 0; // Reset regex
  while ((match = pattern.exec(bestContent)) !== null) {
    // Looking for a function name with Gold, Rupee, INR, Price, or Exchange in it
    if (match[1].toLowerCase().includes('gold') || 
        match[1].toLowerCase().includes('rupee') || 
        match[1].toLowerCase().includes('inr') ||
        match[1].toLowerCase().includes('price') ||
        match[1].toLowerCase().includes('exchange')) {
      
      foundFunctions.push({ 
        name: match[1], 
        type, 
        relevance: (match[1].toLowerCase().includes('gold') ? 2 : 0) + 
                   (match[1].toLowerCase().includes('rupee') || match[1].toLowerCase().includes('inr') ? 2 : 0) +
                   (match[1].toLowerCase().includes('price') ? 1 : 0) +
                   (match[1].toLowerCase().includes('exchange') ? 1 : 0) +
                   (match[1].toLowerCase().includes('chart') ? 1 : 0)
      });
    }
  }
});

// Find chart titles or labels
const foundTitles = [];
chartTitlePatterns.forEach(({ pattern, type }) => {
  let match;
  pattern.lastIndex = 0; // Reset regex
  while ((match = pattern.exec(bestContent)) !== null) {
    foundTitles.push({
      text: match[1],
      type
    });
  }
});

// Sort functions by relevance
foundFunctions.sort((a, b) => b.relevance - a.relevance);
console.log('\nPotential chart functions found:');
foundFunctions.forEach(fn => {
  console.log(`- ${fn.name} (${fn.type}, relevance: ${fn.relevance})`);
});

console.log('\nPotential chart titles/labels found:');
foundTitles.forEach(title => {
  console.log(`- ${title.text} (${title.type})`);
});

// Look for the best function or code section to modify
let targetFunctionName = null;
let codeToModify = null;

if (foundFunctions.length > 0) {
  targetFunctionName = foundFunctions[0].name;
  console.log(`\nSelected target function: ${targetFunctionName}`);
  
  // Try to find the function body
  const functionStart = bestContent.indexOf(targetFunctionName);
  if (functionStart !== -1) {
    // Find the opening brace
    let braceIndex = bestContent.indexOf('{', functionStart);
    if (braceIndex !== -1) {
      // Now find the matching closing brace
      let braceCount = 1;
      let endBraceIndex = braceIndex + 1;
      
      while (braceCount > 0 && endBraceIndex < bestContent.length) {
        if (bestContent[endBraceIndex] === '{') braceCount++;
        if (bestContent[endBraceIndex] === '}') braceCount--;
        endBraceIndex++;
      }
      
      if (braceCount === 0) {
        codeToModify = bestContent.substring(braceIndex, endBraceIndex);
        console.log('✅ Found function body to modify');
      }
    }
  }
} else {
  // If we can't find a specific function, look for sections containing both gold and chart keywords
  console.log('\nNo specific function identified. Looking for code sections with gold chart references...');
  
  // Split the content into chunks around "new Chart" calls
  const chunks = bestContent.split(/new\s+Chart\s*\(/);
  
  let bestChunkIndex = -1;
  let bestChunkScore = 0;
  
  // Score each chunk
  chunks.forEach((chunk, index) => {
    if (index === 0) return; // Skip first chunk which is before any Chart call
    
    const goldScore = scoreFile(chunk, goldKeywords);
    const dateScore = scoreFile(chunk, dateKeywords);
    const totalScore = goldScore * 2 + dateScore;
    
    if (totalScore > bestChunkScore) {
      bestChunkScore = totalScore;
      bestChunkIndex = index;
    }
  });
  
  if (bestChunkIndex !== -1) {
    // Reconstruct the chunk with the "new Chart(" part
    codeToModify = "new Chart(" + chunks[bestChunkIndex];
    console.log('✅ Found chart code section to modify');
  }
}

// If we still don't have code to modify, fall back to the entire file
if (!codeToModify) {
  console.log('⚠️ Could not isolate specific chart function. Will modify date range settings in entire file.');
  codeToModify = bestContent;
}

// Now make the necessary changes to fix the chart date range
console.log('\n3️⃣ Making changes to fix 5-year chart range...');

// Create a modified version of the code
let modifiedCode = codeToModify;
let anyChanges = false;

// 1. Update any year range constants
const yearRangePatterns = [
  { pattern: /const\s+yearRange\s*=\s*(\d+)/g, replace: 'const yearRange = 5' },
  { pattern: /let\s+yearRange\s*=\s*(\d+)/g, replace: 'let yearRange = 5' },
  { pattern: /var\s+yearRange\s*=\s*(\d+)/g, replace: 'var yearRange = 5' },
  { pattern: /years\s*[:=]\s*(\d+)/g, replace: match => match.replace(/\d+/, '5') },
  { pattern: /startDate\.setFullYear\(.*getFullYear\(\)\s*-\s*(\d+)\)/g, replace: match => match.replace(/\d+(?=\))/, '5') },
  { pattern: /setFullYear\(.*getFullYear\(\)\s*-\s*(\d+)\)/g, replace: match => match.replace(/\d+(?=\))/, '5') }
];

yearRangePatterns.forEach(({ pattern, replace }) => {
  if (pattern.test(modifiedCode)) {
    console.log(`Found pattern: ${pattern}`);
    modifiedCode = modifiedCode.replace(pattern, (match) => {
      console.log(`Replacing: ${match} with ${typeof replace === 'function' ? replace(match) : replace}`);
      anyChanges = true;
      return typeof replace === 'function' ? replace(match) : replace;
    });
  }
});

// 2. If there are no direct year settings, look for date filters and expand them
if (!anyChanges && modifiedCode.includes('date') && modifiedCode.includes('filter')) {
  console.log('Looking for date filters to modify...');
  
  const dateFilterPatterns = [
    { 
      pattern: /\.filter\(\s*([^=]+)\s*=>\s*new\s+Date\(\s*([^)]+)\.date\s*\)\s*>\s*startDate\s*\)/g, 
      replace: (match) => {
        console.log(`Found date filter: ${match}`);
        return '.filter(item => { ' +
               'const itemDate = new Date(item.date); ' +
               'const startDate = new Date(); ' +
               'startDate.setFullYear(startDate.getFullYear() - 5); ' +
               'return itemDate >= startDate; ' + 
               '})';
      }
    },
    { 
      pattern: /const\s+startDate\s*=\s*new\s+Date\([^)]*\);\s*startDate\.setFullYear/g, 
      replace: (match) => {
        console.log(`Found startDate definition: ${match}`);
        return 'const startDate = new Date(); startDate.setFullYear';
      }
    }
  ];
  
  dateFilterPatterns.forEach(({ pattern, replace }) => {
    if (pattern.test(modifiedCode)) {
      modifiedCode = modifiedCode.replace(pattern, replace);
      anyChanges = true;
    }
  });
}

// 3. If still no changes, insert a custom 5-year range filter
if (!anyChanges) {
  console.log('No existing date range code found. Adding custom 5-year filter code...');
  
  // Look for data loading or chart creation points to insert our code
  const insertionPoints = [
    { pattern: /\.then\(\s*response\s*=>\s*response\.json\(\)\s*\)\s*\.then\(\s*data\s*=>\s*{/g, 
      prepend: false,
      code: `
      // Ensure 5-year data range for chart
      data = Array.isArray(data) ? data.filter(item => {
        if (!item || !item.date) return true;
        const itemDate = new Date(item.date);
        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
        return itemDate >= fiveYearsAgo;
      }) : data;
`
    },
    { pattern: /new\s+Chart\(\s*.*\s*,\s*{/g, 
      prepend: true,
      code: `
    // Ensure data covers 5-year range
    const ensureFiveYearRange = (data) => {
      if (!Array.isArray(data)) return data;
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
      return data.filter(item => {
        if (!item || !item.date) return true;
        return new Date(item.date) >= fiveYearsAgo;
      });
    };
    
    // Apply 5-year filter to chart data
    if (Array.isArray(data)) {
      data = ensureFiveYearRange(data);
    } else if (data && data.goldData) {
      data.goldData = ensureFiveYearRange(data.goldData);
      if (data.rupeeData) data.rupeeData = ensureFiveYearRange(data.rupeeData);
    }
`
    }
  ];
  
  for (const { pattern, prepend, code } of insertionPoints) {
    if (pattern.test(modifiedCode)) {
      console.log(`Found insertion point: ${pattern}`);
      modifiedCode = modifiedCode.replace(pattern, (match) => {
        return prepend ? code + match : match + code;
      });
      anyChanges = true;
      break;
    }
  }
}

// Apply the changes to the file
if (anyChanges) {
  // If we only modified a section, we need to splice it back into the full content
  let finalContent;
  if (codeToModify !== bestContent) {
    finalContent = bestContent.replace(codeToModify, modifiedCode);
  } else {
    finalContent = modifiedCode;
  }
  
  fs.writeFileSync(bestFile, finalContent);
  console.log(`\n✅ Successfully updated ${bestFile} with 5-year chart range fixes`);
  
  // Create simple restore script
  const restoreScript = `// Simple script to restore original file
const fs = require('fs');
try {
  fs.copyFileSync('${backupPath}', '${bestFile}');
  console.log('Successfully restored file from backup');
} catch (err) {
  console.error('Error restoring file:', err.message);
}`;
  
  fs.writeFileSync('./restore-chart-fix.js', restoreScript);
  console.log('✅ Created restore script (restore-chart-fix.js) in case you need to revert changes');
} else {
  console.log('\n⚠️ No changes were made to the file');
}

console.log('\nNext steps:');
console.log('1. Add your changes: git add .');
console.log('2. Commit: git commit -m "Fix Gold chart to show full 5-year data range"');
console.log('3. Push: git push');
console.log('4. Deploy to Vercel: npx vercel --prod');
