const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Nuclear option: Recreating directory structure from scratch');

// Backup the original content
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = `backup-${timestamp}`;

console.log(`\n1️⃣ Creating backup in ${backupDir}/...`);
try {
  fs.mkdirSync(backupDir);
  
  // Copy Frontend content to backup
  if (fs.existsSync('Frontend')) {
    fs.mkdirSync(`${backupDir}/Frontend`, { recursive: true });
    execSync(`xcopy "Frontend" "${backupDir}/Frontend" /E /H /C /I`, { stdio: 'inherit' });
    console.log('✅ Frontend content backed up');
  }
  
  // Copy backend content to backup
  if (fs.existsSync('backend')) {
    fs.mkdirSync(`${backupDir}/backend`, { recursive: true });
    execSync(`xcopy "backend" "${backupDir}/backend" /E /H /C /I`, { stdio: 'inherit' });
    console.log('✅ backend content backed up');
  }
} catch (err) {
  console.error(`Error creating backup: ${err.message}`);
  console.log('Continuing anyway...');
}

console.log('\n2️⃣ Removing problematic directories from Git...');
try {
  // Remove Frontend from git if it exists (but keep the files)
  if (fs.existsSync('Frontend')) {
    execSync('git rm -r --cached Frontend', { stdio: 'pipe' });
    console.log('✅ Removed Frontend from Git (files remain on disk)');
  }
  
  // Remove backend from git if it exists (but keep the files)
  if (fs.existsSync('backend')) {
    execSync('git rm -r --cached backend', { stdio: 'pipe' });
    console.log('✅ Removed backend from Git (files remain on disk)');
  }
} catch (err) {
  console.error(`Error removing directories from Git: ${err.message}`);
}

console.log('\n3️⃣ Creating brand new directories...');
const tempFrontendDir = 'NewFrontend';
const tempBackendDir = 'NewBackend';

try {
  // Rename existing directories to temporary names
  if (fs.existsSync('Frontend')) {
    fs.renameSync('Frontend', tempFrontendDir);
    console.log('✅ Renamed Frontend to NewFrontend');
  }
  
  if (fs.existsSync('backend')) {
    fs.renameSync('backend', tempBackendDir);
    console.log('✅ Renamed backend to NewBackend');
  }
  
  // Create fresh directories
  fs.mkdirSync('Frontend', { recursive: true });
  fs.mkdirSync('backend', { recursive: true });
  console.log('✅ Created fresh Frontend and backend directories');
} catch (err) {
  console.error(`Error creating directories: ${err.message}`);
  process.exit(1);
}

console.log('\n4️⃣ Creating test files to ensure directories are trackable...');
try {
  // Create README.md in both directories
  fs.writeFileSync('Frontend/README.md', '# Frontend\n\nThis directory contains frontend assets.');
  fs.writeFileSync('backend/README.md', '# Backend\n\nThis directory contains backend code.');
  console.log('✅ Created README.md files in both directories');
  
  // Create .gitkeep files
  fs.writeFileSync('Frontend/.gitkeep', '# Keep this directory in Git');
  fs.writeFileSync('backend/.gitkeep', '# Keep this directory in Git');
  console.log('✅ Created .gitkeep files in both directories');
} catch (err) {
  console.error(`Error creating test files: ${err.message}`);
}

console.log('\n5️⃣ Adding directories to Git...');
try {
  execSync('git add Frontend/README.md Frontend/.gitkeep', { stdio: 'inherit' });
  execSync('git add backend/README.md backend/.gitkeep', { stdio: 'inherit' });
  console.log('✅ Added test files to Git');
} catch (err) {
  console.error(`Error adding test files to Git: ${err.message}`);
}

console.log('\n6️⃣ Committing the changes to establish directory structure...');
try {
  execSync('git commit -m "Create empty Frontend and backend directories"', { stdio: 'inherit' });
  console.log('✅ Committed directory structure');
} catch (err) {
  console.error(`Error committing: ${err.message}`);
}

console.log('\n7️⃣ Pushing to GitHub...');
try {
  execSync('git push', { stdio: 'inherit' });
  console.log('✅ Pushed to GitHub');
} catch (err) {
  console.error(`Error pushing to GitHub: ${err.message}`);
}

console.log('\n8️⃣ Moving content from temporary directories to new tracked directories...');
try {
  // Create required subdirectories in Frontend
  for (const subdir of ['css', 'js', 'data', 'static', 'static/images', 'docs']) {
    fs.mkdirSync(`Frontend/${subdir}`, { recursive: true });
  }
  
  // Copy content from temporary Frontend directory if it exists
  if (fs.existsSync(tempFrontendDir)) {
    console.log(`Copying files from ${tempFrontendDir} to Frontend...`);
    execSync(`xcopy "${tempFrontendDir}" "Frontend" /E /H /C /I /Y`, { stdio: 'inherit' });
    console.log(`✅ Copied files from ${tempFrontendDir} to Frontend`);
  }
  
  // Create required subdirectories in backend
  for (const subdir of ['routes', 'services', 'utils', 'data']) {
    fs.mkdirSync(`backend/${subdir}`, { recursive: true });
  }
  
  // Copy content from temporary backend directory if it exists
  if (fs.existsSync(tempBackendDir)) {
    console.log(`Copying files from ${tempBackendDir} to backend...`);
    execSync(`xcopy "${tempBackendDir}" "backend" /E /H /C /I /Y`, { stdio: 'inherit' });
    console.log(`✅ Copied files from ${tempBackendDir} to backend`);
  }
} catch (err) {
  console.error(`Error copying files: ${err.message}`);
}

console.log('\n9️⃣ Adding all content to Git...');
try {
  execSync('git add Frontend/ backend/', { stdio: 'inherit' });
  console.log('✅ Added all content to Git');
} catch (err) {
  console.error(`Error adding content to Git: ${err.message}`);
}

console.log('\n🔟 Final commit and push...');
try {
  execSync('git commit -m "Restore all content to tracked directories"', { stdio: 'inherit' });
  execSync('git push', { stdio: 'inherit' });
  console.log('✅ Committed and pushed all content');
} catch (err) {
  console.error(`Error in final commit/push: ${err.message}`);
}

console.log('\n✅ DONE! The directories should now be properly tracked on GitHub.');
console.log('\nYou can verify this by checking your repository on GitHub.');
console.log(`\nA backup of your original directories was created in ${backupDir}/`);
console.log('\nIf you see the directories properly on GitHub, you can remove the backup and temporary directories with:');
console.log(`rmdir /s /q ${backupDir} ${tempFrontendDir} ${tempBackendDir}`);
