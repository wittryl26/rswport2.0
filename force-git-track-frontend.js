const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚨 EMERGENCY FIX: Ensuring Frontend folder is visible on GitHub 🚨');

// Get absolute paths
const rootDir = process.cwd();
const frontendDir = path.join(rootDir, 'Frontend');

console.log(`Working directory: ${rootDir}`);
console.log(`Frontend directory: ${frontendDir}`);

// 1. Create guaranteed test files that will show up
const testFiles = [
  { path: 'Frontend/README.md', content: '# Frontend\n\nThis directory contains all frontend assets for the portfolio website.' },
  { path: 'Frontend/test.html', content: '<!DOCTYPE html><html><head><title>Test File</title></head><body><h1>Test File</h1><p>This file ensures the Frontend directory is tracked in Git.</p></body></html>' },
  { path: 'Frontend/.gitkeep', content: '# This file ensures this directory is tracked by Git' }
];

// Create test files
testFiles.forEach(file => {
  const filePath = path.join(rootDir, file.path);
  try {
    console.log(`Creating file: ${filePath}`);
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
    
    fs.writeFileSync(filePath, file.content);
    console.log(`✓ Created: ${filePath}`);
  } catch (err) {
    console.error(`Error creating ${filePath}: ${err.message}`);
  }
});

// 2. Create .gitkeep files in every Frontend subdirectory
const createGitKeepRecursively = (dir) => {
  if (!fs.existsSync(dir)) return;
  
  const gitkeepPath = path.join(dir, '.gitkeep');
  if (!fs.existsSync(gitkeepPath)) {
    try {
      console.log(`Creating .gitkeep in ${dir}`);
      fs.writeFileSync(gitkeepPath, '# This file ensures this directory is tracked by Git');
      console.log(`✓ Created ${gitkeepPath}`);
    } catch (err) {
      console.error(`Error creating .gitkeep in ${dir}: ${err.message}`);
    }
  }
  
  try {
    // Process subdirectories
    const subdirs = fs.readdirSync(dir).filter(item => {
      const itemPath = path.join(dir, item);
      return fs.statSync(itemPath).isDirectory() && item !== 'node_modules' && item !== '.git';
    });
    
    subdirs.forEach(subdir => {
      createGitKeepRecursively(path.join(dir, subdir));
    });
  } catch (err) {
    console.error(`Error processing subdirectories in ${dir}: ${err.message}`);
  }
};

console.log('\nCreating .gitkeep files in all Frontend subdirectories...');
createGitKeepRecursively(frontendDir);

// 3. Manually track specific subdirectories that need to exist
const criticalDirs = [
  'Frontend/css',
  'Frontend/js',
  'Frontend/data',
  'Frontend/static',
  'Frontend/static/images',
  'Frontend/docs'
];

criticalDirs.forEach(dir => {
  const dirPath = path.join(rootDir, dir);
  if (!fs.existsSync(dirPath)) {
    console.log(`Creating important directory: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  // Create test file in each directory
  const testFilePath = path.join(dirPath, 'README.md');
  fs.writeFileSync(testFilePath, `# ${path.basename(dir)}\n\nThis directory is for ${path.basename(dir)} files.`);
  console.log(`Created test file in ${dirPath}`);
  
  // Create .gitkeep as backup
  const gitkeepPath = path.join(dirPath, '.gitkeep');
  fs.writeFileSync(gitkeepPath, '# This ensures the directory is tracked');
});

// 4. Force add everything in Frontend with different methods
console.log('\n🔄 Adding all Frontend files to Git using multiple methods...');

try {
  // Method 1: Add all files using absolute path
  console.log('Method 1: Adding using absolute path...');
  execSync(`git add "${frontendDir}/"`, { stdio: 'inherit' });
  console.log('✓ Method 1 complete');
  
  // Method 2: Add specific test files
  console.log('\nMethod 2: Adding specific test files...');
  testFiles.forEach(file => {
    try {
      execSync(`git add "${path.join(rootDir, file.path)}"`, { stdio: 'pipe' });
      console.log(`  Added ${file.path}`);
    } catch (e) {
      console.error(`  Error adding ${file.path}: ${e.message}`);
    }
  });
  console.log('✓ Method 2 complete');
  
  // Method 3: Force add with -f flag
  console.log('\nMethod 3: Force adding with -f flag...');
  execSync(`git add -f "${frontendDir}/"`, { stdio: 'inherit' });
  console.log('✓ Method 3 complete');
  
  // Method 4: Add each subdirectory individually
  console.log('\nMethod 4: Adding each Frontend subdirectory individually...');
  criticalDirs.forEach(dir => {
    try {
      execSync(`git add "${path.join(rootDir, dir)}/"`, { stdio: 'pipe' });
      console.log(`  Added ${dir}/`);
    } catch (e) {
      console.error(`  Error adding ${dir}/: ${e.message}`);
    }
  });
  console.log('✓ Method 4 complete');
  
} catch (err) {
  console.error(`\n❌ Error adding files: ${err.message}`);
}

// 5. Create a temporary .gitignore in Frontend that specifies files to INCLUDE
const tempGitignorePath = path.join(frontendDir, '.gitignore');
const tempGitignoreContent = `# Temporary .gitignore that INCLUDES files
# The ! pattern negates the exclusion
!*.html
!*.css
!*.js
!*.json
!*.md
!*.jpg
!*.png
!*.svg
!.gitkeep
`;

console.log('\nCreating temporary .gitignore in Frontend to ensure files are included...');
fs.writeFileSync(tempGitignorePath, tempGitignoreContent);
console.log(`✓ Created ${tempGitignorePath}`);

// Add the temporary .gitignore
try {
  execSync(`git add "${tempGitignorePath}"`, { stdio: 'pipe' });
  console.log('✓ Added temporary .gitignore');
} catch (e) {
  console.error(`Error adding temporary .gitignore: ${e.message}`);
}

// 6. Final check of what's staged
try {
  console.log('\n📊 Checking what files are staged in Frontend:');
  const stagedFiles = execSync('git diff --name-only --cached Frontend/').toString();
  
  if (stagedFiles.trim()) {
    console.log(stagedFiles);
    console.log(`✅ ${stagedFiles.split('\n').filter(f => f).length} Frontend files staged for commit!`);
  } else {
    console.log('❌ No Frontend files are staged. Something is wrong!');
  }
} catch (err) {
  console.error(`Error checking staged files: ${err.message}`);
}

console.log('\n🚀 Next steps:');
console.log('1. Commit these changes: git commit -m "Force track Frontend directory"');
console.log('2. Push to GitHub: git push');
console.log('3. Check if Frontend folder is now visible on GitHub');
console.log('\nIf still not working, run this command manually:');
console.log('git add -f Frontend/');
