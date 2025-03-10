const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Files that need to be moved from root to specific directories
const filesToMove = [
  // Root HTML file should go to Frontend
  { src: 'index.html', dest: 'Frontend/index.html', type: 'frontend' },
  
  // Root server.js should go to backend
  { src: 'server.js', dest: 'backend/server.js', type: 'backend' },
  
  // API files should be in backend/api
  { src: 'api/gold-inr-data.js', dest: 'backend/api/gold-inr-data.js', type: 'backend' },
  { src: 'api/health.js', dest: 'backend/api/health.js', type: 'backend' }
];

// Create necessary directories
function createDirectories() {
  try {
    if (!fs.existsSync('backend/api')) {
      fs.mkdirSync('backend/api', { recursive: true });
      console.log('✓ Created backend/api directory');
    }
  } catch (err) {
    console.error('Error creating directories:', err);
  }
}

// Move files using git if possible, otherwise regular file system
function moveFile(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`⚠️ Source file not found: ${src}`);
    return false;
  }
  
  // Create parent directory if it doesn't exist
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  try {
    // Try with git first
    try {
      execSync(`git mv "${src}" "${dest}"`, { stdio: 'pipe' });
      console.log(`✓ Git moved: ${src} → ${dest}`);
      return true;
    } catch (gitErr) {
      // If git move fails, use regular fs move
      fs.copyFileSync(src, dest);
      fs.unlinkSync(src);
      console.log(`✓ Moved: ${src} → ${dest}`);
      return true;
    }
  } catch (err) {
    console.error(`❌ Failed to move ${src} to ${dest}:`, err.message);
    return false;
  }
}

// Main execution
console.log('🔄 Starting project structure fix...');
createDirectories();

// Move files
const moveResults = filesToMove.map(file => {
  console.log(`Moving ${file.type} file: ${file.src}`);
  return moveFile(file.src, file.dest);
});

const successCount = moveResults.filter(result => result).length;
console.log(`\n✅ Fixed ${successCount} of ${filesToMove.length} files`);

// Print git status as a reminder
try {
  console.log('\n📊 Git Status:');
  console.log(execSync('git status --short').toString());
  
  console.log('\n🚀 Next steps:');
  console.log('1. Review the changes with "git status"');
  console.log('2. Test your application to make sure everything still works');
  console.log('3. Commit the changes: git add . && git commit -m "Fix directory structure"');
  console.log('4. Push to GitHub: git push');
} catch (err) {
  console.log('\nNote: Could not run git status command. Make sure git is installed.');
}
