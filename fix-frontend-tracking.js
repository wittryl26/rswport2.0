const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Fixing Frontend directory tracking in Git...');

// Ensure the Frontend directory exists
if (!fs.existsSync('Frontend')) {
  console.log('Creating Frontend directory...');
  fs.mkdirSync('Frontend', { recursive: true });
}

// Files that should be in Frontend based on the file list
const frontendPaths = [
  'Frontend/css',
  'Frontend/data',
  'Frontend/docs',
  'Frontend/js',
  'Frontend/static/images'
];

// Create any missing directories
frontendPaths.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating missing directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Create .gitkeep files in empty directories to ensure they're tracked
frontendPaths.forEach(dir => {
  const gitkeepPath = path.join(dir, '.gitkeep');
  if (!fs.existsSync(gitkeepPath)) {
    console.log(`Creating .gitkeep in ${dir}`);
    fs.writeFileSync(gitkeepPath, '# This file ensures this directory is tracked by Git');
  }
});

// Move root index.html to Frontend if needed
if (fs.existsSync('index.html') && !fs.existsSync('Frontend/index.html')) {
  console.log('Moving index.html to Frontend directory...');
  try {
    fs.copyFileSync('index.html', 'Frontend/index.html');
    console.log('✓ Copied index.html to Frontend/index.html');
    
    // Try to add the new file to git
    try {
      execSync('git add Frontend/index.html');
      console.log('✓ Added Frontend/index.html to git');
    } catch (e) {
      console.log('Note: Could not add Frontend/index.html to git');
    }
  } catch (err) {
    console.error(`Error copying index.html: ${err.message}`);
  }
}

// Create a README.md in Frontend if it doesn't exist
if (!fs.existsSync('Frontend/README.md')) {
  console.log('Creating Frontend/README.md...');
  const readmeContent = `# Frontend
  
This directory contains all frontend assets for the portfolio website:

- \`css/\` - Stylesheet files
- \`js/\` - JavaScript files
- \`data/\` - JSON data files used by the frontend
- \`static/\` - Static assets like images
- \`docs/\` - Documentation files

## Main Files

- \`index.html\` - Main entry point for the website
- \`resume.html\` - Resume page
- \`financial-model-pdf.html\` - Financial model PDF viewer
- \`debug-charts.html\` - Chart debugging page
`;

  fs.writeFileSync('Frontend/README.md', readmeContent);
  console.log('✓ Created Frontend/README.md');
}

// Add all files in Frontend directory to git
console.log('\nAdding all Frontend files to Git...');
try {
  execSync('git add Frontend/. --force', { stdio: 'inherit' });
  console.log('✓ Added all Frontend files to git');
} catch (err) {
  console.error(`Error adding Frontend files: ${err.message}`);
}

// Check if we need to create other frontend files
const essentialFiles = [
  { path: 'Frontend/css/styles.css', content: '/* Main stylesheet for portfolio website */' },
  { path: 'Frontend/js/script.js', content: '// Main JavaScript file for portfolio website' }
];

essentialFiles.forEach(file => {
  if (!fs.existsSync(file.path)) {
    console.log(`Creating ${file.path}...`);
    // Create directory if it doesn't exist
    const dir = path.dirname(file.path);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(file.path, file.content);
    console.log(`✓ Created ${file.path}`);
    
    // Add to git
    try {
      execSync(`git add "${file.path}"`, { stdio: 'pipe' });
    } catch (e) {
      // Ignore errors
    }
  }
});

// Commit the changes
console.log('\n📊 Current Git status:');
execSync('git status', { stdio: 'inherit' });

console.log('\n🚀 Next steps:');
console.log('1. Commit the changes: git commit -m "Fix Frontend directory tracking"');
console.log('2. Push to your repository: git push');
console.log('3. Verify the Frontend directory appears in GitHub');
