const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Fixing nested Git repository issue...');

const nestedGitDirs = [
  'Frontend/.git',
  'backend/.git'
];

// 1. Remove any nested .git directories
console.log('\n1️⃣ Removing nested .git directories...');
nestedGitDirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    console.log(`Found nested Git repository in ${dir}`);
    try {
      // Use rimraf-like approach for recursive deletion
      if (process.platform === 'win32') {
        execSync(`rmdir /s /q "${fullPath}"`, { stdio: 'inherit' });
      } else {
        execSync(`rm -rf "${fullPath}"`, { stdio: 'inherit' });
      }
      console.log(`✅ Removed ${dir}`);
    } catch (err) {
      console.error(`❌ Error removing ${dir}: ${err.message}`);
    }
  } else {
    console.log(`No .git directory found in ${dir.split('/.')[0]}`);
  }
});

// 2. Remove the directories from Git index (but keep files)
console.log('\n2️⃣ Removing directories from Git index...');
try {
  execSync('git rm --cached Frontend', { stdio: 'pipe' });
  console.log('✅ Removed Frontend from Git index');
} catch (err) {
  console.log('Note: Frontend is not currently in the Git index');
}

try {
  execSync('git rm --cached backend', { stdio: 'pipe' });
  console.log('✅ Removed backend from Git index');
} catch (err) {
  console.log('Note: backend is not currently in the Git index');
}

// 3. Create tracking files
console.log('\n3️⃣ Creating tracking files...');

// Ensure directories exist
if (!fs.existsSync('Frontend')) {
  fs.mkdirSync('Frontend', { recursive: true });
  console.log('Created Frontend directory');
}

if (!fs.existsSync('backend')) {
  fs.mkdirSync('backend', { recursive: true });
  console.log('Created backend directory');
}

// Create README files
fs.writeFileSync('Frontend/README.md', '# Frontend\n\nThis directory contains frontend code and assets.');
console.log('✅ Created Frontend/README.md');

fs.writeFileSync('backend/README.md', '# Backend\n\nThis directory contains server-side code and API endpoints.');
console.log('✅ Created backend/README.md');

// 4. Add directories to Git (now without nested .git folders)
console.log('\n4️⃣ Adding directories to Git...');
try {
  execSync('git add Frontend/README.md', { stdio: 'inherit' });
  execSync('git add backend/README.md', { stdio: 'inherit' });
  console.log('✅ Added README files to Git');
} catch (err) {
  console.error(`Error adding files to Git: ${err.message}`);
}

// 5. Commit and push
console.log('\n5️⃣ Committing changes...');
try {
  execSync('git commit -m "Fix nested Git repository issue"', { stdio: 'inherit' });
  console.log('✅ Changes committed');
  
  console.log('\n6️⃣ Pushing to GitHub...');
  execSync('git push', { stdio: 'inherit' });
  console.log('✅ Changes pushed to GitHub');
} catch (err) {
  console.error(`Error with Git operations: ${err.message}`);
}

console.log('\n✅ Nested Git repository issue should now be fixed!');
console.log('\nNext steps for adding all your content:');
console.log('1. Verify on GitHub that the Frontend and backend directories appear');
console.log('2. Add all content with: git add Frontend/ backend/');
console.log('3. Commit: git commit -m "Add all project files"');
console.log('4. Push: git push');
