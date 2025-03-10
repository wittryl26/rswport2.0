const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Alternative approach: Direct Git tracking fix');

// Create a .gitkeep file in a directory to ensure Git tracks it
function createGitkeepFile(dir) {
  const gitkeepPath = path.join(dir, '.gitkeep');
  try {
    fs.writeFileSync(gitkeepPath, '# This file ensures this directory is tracked in Git');
    console.log(`✅ Created .gitkeep in ${dir}`);
    return true;
  } catch (err) {
    console.error(`❌ Error creating .gitkeep in ${dir}: ${err.message}`);
    return false;
  }
}

// Create a README.md file in a directory
function createReadmeFile(dir, title) {
  const readmePath = path.join(dir, 'README.md');
  try {
    fs.writeFileSync(readmePath, `# ${title}\n\nThis directory contains ${title.toLowerCase()} files.`);
    console.log(`✅ Created README.md in ${dir}`);
    return true;
  } catch (err) {
    console.error(`❌ Error creating README.md in ${dir}: ${err.message}`);
    return false;
  }
}

console.log('\n1️⃣ Ensuring directories exist and adding Git tracking files...');
try {
  // Ensure Frontend directory exists
  if (!fs.existsSync('Frontend')) {
    fs.mkdirSync('Frontend', { recursive: true });
    console.log('✅ Created Frontend directory');
  }
  
  // Ensure backend directory exists
  if (!fs.existsSync('backend')) {
    fs.mkdirSync('backend', { recursive: true });
    console.log('✅ Created backend directory');
  }
  
  // Add tracking files to Frontend
  createGitkeepFile('Frontend');
  createReadmeFile('Frontend', 'Frontend');
  
  // Add tracking files to backend
  createGitkeepFile('backend');
  createReadmeFile('backend', 'Backend');
  
  // Add tracking files to key subdirectories
  const frontendDirs = ['css', 'js', 'data', 'static/images', 'docs'].map(d => path.join('Frontend', d));
  const backendDirs = ['routes', 'services', 'utils', 'data'].map(d => path.join('backend', d));
  
  // Create subdirectories in Frontend
  frontendDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created ${dir} directory`);
    }
    createGitkeepFile(dir);
  });
  
  // Create subdirectories in backend
  backendDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created ${dir} directory`);
    }
    createGitkeepFile(dir);
  });
  
} catch (err) {
  console.error(`Error in directory preparation: ${err.message}`);
}

console.log('\n2️⃣ Creating additional placeholder files to ensure structure is tracked...');
try {
  // Create an index.html in Frontend if it doesn't exist
  if (!fs.existsSync('Frontend/index.html')) {
    fs.writeFileSync('Frontend/index.html', '<!DOCTYPE html>\n<html>\n<head>\n  <title>Portfolio</title>\n</head>\n<body>\n  <h1>Portfolio Site</h1>\n</body>\n</html>');
    console.log('✅ Created placeholder index.html in Frontend');
  }
  
  // Create a server.js in backend if it doesn't exist
  if (!fs.existsSync('backend/server.js')) {
    fs.writeFileSync('backend/server.js', '// Server entry point\nconsole.log("Server starting...");\n');
    console.log('✅ Created placeholder server.js in backend');
  }
} catch (err) {
  console.error(`Error creating placeholder files: ${err.message}`);
}

console.log('\n3️⃣ Removing directories from Git cache if they exist there...');
try {
  // Remove from Git cache without deleting files
  execSync('git rm -r --cached Frontend 2>nul', { stdio: 'pipe' });
  execSync('git rm -r --cached backend 2>nul', { stdio: 'pipe' });
  console.log('✅ Removed directories from Git cache (if they existed)');
} catch (err) {
  // Ignore errors - directories might not be in Git yet
  console.log('Note: Could not remove from Git cache - might not exist yet');
}

console.log('\n4️⃣ Forcing tracked files to be added to Git...');
try {
  // Add specific tracking files to be sure they're included
  execSync('git add Frontend/README.md Frontend/.gitkeep', { stdio: 'inherit' });
  execSync('git add backend/README.md backend/.gitkeep', { stdio: 'inherit' });
  
  // Add placeholder files
  execSync('git add Frontend/index.html', { stdio: 'inherit' });
  execSync('git add backend/server.js', { stdio: 'inherit' });
  
  // Add .gitkeep files in subdirectories
  [...frontendDirs, ...backendDirs].forEach(dir => {
    try {
      execSync(`git add ${dir}/.gitkeep`, { stdio: 'pipe' });
    } catch (e) {
      // Ignore errors
    }
  });
  
  console.log('✅ Added tracking files to Git');
} catch (err) {
  console.error(`Error adding files to Git: ${err.message}`);
}

console.log('\n5️⃣ Committing changes to establish directory structure...');
try {
  execSync('git commit -m "Add directory structure tracking files"', { stdio: 'inherit' });
  console.log('✅ Committed directory structure');
} catch (err) {
  console.error(`Error committing: ${err.message}`);
}

console.log('\n6️⃣ Pushing to GitHub...');
try {
  execSync('git push', { stdio: 'inherit' });
  console.log('✅ Pushed to GitHub');
} catch (err) {
  console.error(`Error pushing to GitHub: ${err.message}`);
}

console.log('\n✅ DONE! The directories should now be tracked on GitHub.');
console.log('\nCheck your repository on GitHub to verify the directory structure appears correctly.');
console.log('\nIf Frontend and backend directories now appear correctly on GitHub, you can:');
console.log('1. Add the rest of your files with: git add Frontend/ backend/');
console.log('2. Commit with: git commit -m "Add project files"');
console.log('3. Push with: git push');
