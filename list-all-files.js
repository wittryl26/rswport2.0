const fs = require('fs');
const path = require('path');

// Only ignore these essential directories
const ignoreList = ['node_modules', '.git'];

function listAllFiles(dir, fileList = []) {
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      
      // Skip ignored directories
      if (ignoreList.some(ignore => fullPath.includes(ignore))) {
        continue;
      }
      
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        // Recursively scan subdirectories
        listAllFiles(fullPath, fileList);
      } else {
        // Add file to list
        fileList.push(fullPath);
      }
    }
    
    return fileList;
  } catch (err) {
    console.error(`Error reading directory: ${dir}`, err);
    return fileList;
  }
}

// Get current directory
const currentDir = process.cwd();
console.log(`Scanning directory: ${currentDir}`);

// Get all files
const allFiles = listAllFiles(currentDir);

// Group files by extension
const filesByExtension = {};
allFiles.forEach(file => {
  const ext = path.extname(file).toLowerCase() || 'no-extension';
  if (!filesByExtension[ext]) {
    filesByExtension[ext] = [];
  }
  filesByExtension[ext].push(file);
});

// Print results
console.log('\n=== FILES BY EXTENSION ===');
Object.keys(filesByExtension).sort().forEach(ext => {
  console.log(`\n${ext} (${filesByExtension[ext].length} files):`);
  filesByExtension[ext].forEach(file => {
    console.log(`  ${file}`);
  });
});

// Print summary
console.log('\n=== SUMMARY ===');
console.log(`Total files found: ${allFiles.length}`);
Object.keys(filesByExtension).sort().forEach(ext => {
  console.log(`${ext}: ${filesByExtension[ext].length} files`);
});

// Save the full list to a file for reference
fs.writeFileSync('all-files.json', JSON.stringify({
  summary: {
    totalFiles: allFiles.length,
    byExtension: Object.fromEntries(
      Object.entries(filesByExtension).map(([ext, files]) => [ext, files.length])
    )
  },
  files: allFiles,
  byExtension: filesByExtension
}, null, 2));

console.log('\nComplete file list saved to all-files.json');
console.log('\nFor manual organization:');
console.log('1. Review the file list');
console.log('2. Move frontend files: git mv [file] Frontend/[file]');
console.log('3. Move backend files: git mv [file] backend/[file]');
