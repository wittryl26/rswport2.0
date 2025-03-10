const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Starting final structure cleanup...');

// Files that show as deleted but need to be recovered/moved
const deletedFiles = [
  { name: 'index.html', source: 'index.html', destination: 'Frontend/index.html' },
  { name: 'server.js', source: 'server.js', destination: 'backend/server.js' }
];

// Handle deleted files
deletedFiles.forEach(file => {
  console.log(`\n📄 Processing ${file.name}...`);
  
  // Try to find the file in git history
  try {
    // Check if the destination already exists
    if (fs.existsSync(file.destination)) {
      console.log(`✓ ${file.destination} already exists, no recovery needed`);
    } else {
      // Try to recover the file content from git
      console.log(`Attempting to recover ${file.name} from git history...`);
      const fileContent = execSync(`git show HEAD:${file.source}`).toString();
      
      // Ensure destination directory exists
      const destDir = path.dirname(file.destination);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      // Write recovered content to destination
      fs.writeFileSync(file.destination, fileContent);
      console.log(`✓ Recovered ${file.name} to ${file.destination}`);
    }
  } catch (err) {
    console.error(`❌ Failed to recover ${file.name}: ${err.message}`);
  }
});

// Add all untracked files in one go
console.log('\n📦 Adding all files to git...');
try {
  execSync('git add .', { stdio: 'inherit' });
  console.log('✓ Added all files to git staging area');
  
  // Show the current status
  console.log('\n📊 Current git status:');
  execSync('git status', { stdio: 'inherit' });
  
  console.log('\n🚀 Next steps:');
  console.log('1. Review the changes once more');
  console.log('2. Commit with: git commit -m "Fix project structure"');
  console.log('3. Push changes: git push');
} catch (err) {
  console.error(`❌ Git command failed: ${err.message}`);
}

// Suggest creating a .gitignore file if it doesn't exist
if (!fs.existsSync('.gitignore')) {
  console.log('\n⚠️ No .gitignore file found. Consider creating one with:');
  const suggestedGitignore = `# Node
node_modules/
npm-debug.log
yarn-error.log
package-lock.json

# Environment
.env
.env.local
.env.development
.env.test
.env.production

# Build files
build/
dist/
out/
coverage/

# OS files
.DS_Store
Thumbs.db

# Editor directories and files
.idea/
.vscode/
*.swp
*.swo

# Temporary files
*.log
*.tmp
`;

  console.log('```');
  console.log(suggestedGitignore);
  console.log('```');
  
  const createGitignore = true;
  if (createGitignore) {
    fs.writeFileSync('.gitignore', suggestedGitignore);
    console.log('✓ Created .gitignore file');
  }
}
