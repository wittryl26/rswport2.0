const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Tracking all untracked files in the project...');

// Ensure both directories exist
const ensureDirectoriesExist = () => {
  const directories = ['Frontend', 'backend'];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Add all files in specified directory to git
const trackFilesInDirectory = (directory) => {
  console.log(`\n📁 Adding files in ${directory}/ directory...`);
  
  try {
    // First check if the directory exists and has files
    if (fs.existsSync(directory) && fs.readdirSync(directory).length > 0) {
      // Add all files in this directory
      execSync(`git add "${directory}/"`, { stdio: 'inherit' });
      console.log(`✅ Successfully added files in ${directory}/ to git tracking`);
    } else {
      console.log(`⚠️ Directory ${directory}/ is empty or doesn't exist`);
    }
  } catch (error) {
    console.error(`❌ Error adding files in ${directory}/: ${error.message}`);
  }
};

// Add specific files that should be tracked
const trackSpecificFiles = () => {
  console.log('\n📄 Adding specific files in root directory...');
  
  const rootFiles = [
    'package.json',
    'package-lock.json',
    'vercel.json',
    'README.md',
    '*.md',
    '*.js',
    '*.sh',
    '*.ps1',
    '*.bat'
  ];
  
  rootFiles.forEach(file => {
    try {
      execSync(`git add ${file}`, { stdio: 'pipe' });
      console.log(`✓ Added ${file}`);
    } catch (error) {
      // Ignore errors for pattern matches that find no files
    }
  });
};

// Create a .gitignore file if it doesn't exist
const createGitignore = () => {
  if (!fs.existsSync('.gitignore')) {
    console.log('\n📝 Creating .gitignore file...');
    
    const gitignoreContent = `# Node
node_modules/
npm-debug.log
yarn-error.log

# Environment files
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

    fs.writeFileSync('.gitignore', gitignoreContent);
    console.log('✅ Created .gitignore file');
    
    // Add the gitignore file itself
    execSync('git add .gitignore', { stdio: 'pipe' });
  }
};

// Main execution
try {
  // Make sure directories exist
  ensureDirectoriesExist();
  
  // Track files in each major directory
  trackFilesInDirectory('Frontend');
  trackFilesInDirectory('backend');
  
  // Track specific files in root
  trackSpecificFiles();
  
  // Create gitignore
  createGitignore();
  
  // Show status
  console.log('\n📊 Current git status:');
  execSync('git status', { stdio: 'inherit' });
  
  console.log('\n✅ All files are now tracked by git!');
  console.log('\n🚀 Next steps:');
  console.log('1. Review the changes with "git status"');
  console.log('2. Commit the changes: git commit -m "Track all project files"');
  console.log('3. Push to your repository: git push');
  
} catch (error) {
  console.error(`\n❌ Error during execution: ${error.message}`);
  console.log('\nTry running the following commands manually:');
  console.log('git add Frontend/');
  console.log('git add backend/');
  console.log('git add package.json README.md vercel.json');
}
