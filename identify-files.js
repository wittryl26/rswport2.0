const fs = require('fs');
const path = require('path');

// Files/patterns that indicate frontend files
const frontendPatterns = [
  /\.jsx?$/,
  /\.tsx?$/,
  /\.css$/,
  /\.scss$/,
  /\.html$/,
  /package\.json$/,
  /webpack/,
  /vite/,
  /component/i,
  /page/i,
  /view/i
];

// Files/patterns that indicate backend files
const backendPatterns = [
  /server\.js$/,
  /app\.js$/,
  /\.env$/,
  /route/i,
  /model/i,
  /controller/i,
  /middleware/i,
  /config/i,
  /api/i,
  /database/i
];

// Files/directories to ignore
const ignorePatterns = [
  /node_modules/,
  /\.git/,
  /dist/,
  /build/,
  /Frontend/,
  /backend/
];

function shouldIgnore(filePath) {
  return ignorePatterns.some(pattern => pattern.test(filePath));
}

function categorizeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check file content for hints
  const hasReactImport = content.includes('import React') || content.includes('from "react"') || content.includes('from \'react\'');
  const hasNodeImports = content.includes('require(\'express\'') || content.includes('require("express"') || 
                        content.includes('import express') || content.includes('mongoose');
  
  // Check file path and name patterns
  const isFrontend = frontendPatterns.some(pattern => pattern.test(filePath)) || hasReactImport;
  const isBackend = backendPatterns.some(pattern => pattern.test(filePath)) || hasNodeImports;

  if (isFrontend && !isBackend) return 'Frontend';
  if (isBackend && !isFrontend) return 'backend';
  if (isFrontend && isBackend) return 'both'; // Mixed content
  return 'unknown';
}

function scanDirectory(dir, results = { Frontend: [], backend: [], both: [], unknown: [] }) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    
    if (shouldIgnore(fullPath)) continue;
    
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory()) {
      scanDirectory(fullPath, results);
    } else {
      try {
        const category = categorizeFile(fullPath);
        results[category].push(fullPath);
      } catch (err) {
        console.log(`Error processing ${fullPath}: ${err.message}`);
      }
    }
  }
  
  return results;
}

// Run the scan from current directory
const results = scanDirectory(process.cwd());

console.log('=== FILES CATEGORIZATION ===');
console.log('\nFrontend files:');
results.Frontend.forEach(f => console.log(`- ${f}`));

console.log('\nBackend files:');
results.backend.forEach(f => console.log(`- ${f}`));

if (results.both.length > 0) {
  console.log('\nMixed content (needs manual review):');
  results.both.forEach(f => console.log(`- ${f}`));
}

if (results.unknown.length > 0) {
  console.log('\nUnknown files:');
  results.unknown.forEach(f => console.log(`- ${f}`));
}

// Save results to a JSON file for use by the fix script
fs.writeFileSync('file-categories.json', JSON.stringify(results, null, 2));
console.log('\nResults saved to file-categories.json');
