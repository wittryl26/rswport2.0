const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚑 Site Recovery Tool');
console.log('Attempting to restore functionality after chart fix broke the site');

// First check if we can simply revert the last commit
console.log('\n1️⃣ Checking for recent commits to revert...');

try {
  const lastCommitMessage = execSync('git log -1 --pretty=%B').toString().trim();
  console.log(`Last commit message: "${lastCommitMessage}"`);
  
  if (lastCommitMessage.includes('chart') || 
      lastCommitMessage.includes('gold') || 
      lastCommitMessage.includes('fix-chart')) {
    
    console.log('\n✅ Found a recent chart-related commit that likely caused the issue.');
    console.log('\nRecommended action:');
    console.log('Run the following to revert the last commit:');
    console.log('\n  git revert HEAD --no-edit');
    console.log('  git push');
    console.log('  npx vercel --prod');
    
    const shouldRevert = true; // Change to false if you don't want auto-revert
    
    if (shouldRevert) {
      console.log('\n🔄 Reverting last commit...');
      execSync('git revert HEAD --no-edit', { stdio: 'inherit' });
      console.log('\n✅ Successfully reverted changes. Please run:');
      console.log('  git push');
      console.log('  npx vercel --prod');
      
      process.exit(0);
    }
  }
} catch (err) {
  console.log('Could not check git history:', err.message);
}

// Check for API directory changes that might have caused issues
console.log('\n2️⃣ Checking API directory for problematic files...');

const apiDir = './api';
if (fs.existsSync(apiDir)) {
  try {
    const apiFiles = fs.readdirSync(apiDir);
    
    console.log(`Found ${apiFiles.length} files in API directory`);
    
    // Remove problematic API files
    const filesToRemove = [
      'gold-exchange-rate-data.js',
      'gold-inr-data.js'
    ];
    
    filesToRemove.forEach(file => {
      const fullPath = path.join(apiDir, file);
      if (fs.existsSync(fullPath)) {
        fs.renameSync(fullPath, `${fullPath}.bak`);
        console.log(`✅ Renamed ${file} to ${file}.bak`);
      }
    });
    
  } catch (err) {
    console.error('Error processing API directory:', err.message);
  }
}

// Look for recent changes to JS files
console.log('\n3️⃣ Checking for recently modified JS files...');

const jsDirectories = ['./newfrontend/js', './backend/routes', './api'];
const recentlyModified = [];

jsDirectories.forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir)
      .filter(file => file.endsWith('.js'))
      .map(file => path.join(dir, file))
      .forEach(file => {
        try {
          const stats = fs.statSync(file);
          const fileModifiedTime = stats.mtime;
          const hoursSinceModified = (new Date() - fileModifiedTime) / (1000 * 60 * 60);
          
          // Check if modified in the last 2 hours
          if (hoursSinceModified < 2) {
            recentlyModified.push({
              path: file,
              hours: hoursSinceModified
            });
          }
        } catch (err) {
          console.error(`Error checking ${file}:`, err.message);
        }
      });
  }
});

if (recentlyModified.length > 0) {
  console.log(`Found ${recentlyModified.length} recently modified files:`);
  recentlyModified.forEach(file => {
    console.log(`  - ${file.path} (${file.hours.toFixed(2)} hours ago)`);
  });
}

// Check if backup files exist and restore them
console.log('\n4️⃣ Looking for backup files to restore...');

const backupExtensions = ['.bak', '.backup', '.original'];
const foundBackups = [];

// Look for files with backup extensions
jsDirectories.forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir)
      .filter(file => backupExtensions.some(ext => file.endsWith(ext)))
      .forEach(file => {
        foundBackups.push(path.join(dir, file));
      });
  }
});

if (foundBackups.length > 0) {
  console.log(`Found ${foundBackups.length} backup files:`);
  foundBackups.forEach(file => console.log(`  - ${file}`));
  
  console.log('\nRestoring backups...');
  foundBackups.forEach(backupFile => {
    const originalFile = backupFile.replace(/\.(bak|backup|original)$/, '');
    
    try {
      fs.copyFileSync(backupFile, originalFile);
      console.log(`✅ Restored ${originalFile} from ${backupFile}`);
    } catch (err) {
      console.error(`Error restoring ${originalFile}:`, err.message);
    }
  });
}

// Create a minimal clean version of econ-data.js if needed
console.log('\n5️⃣ Checking econ-data.js for issues...');

const econDataFile = './newfrontend/js/econ-data.js';
if (fs.existsSync(econDataFile)) {
  // Create a backup if we don't already have one
  const econDataBackupFile = `${econDataFile}.original`;
  if (!fs.existsSync(econDataBackupFile)) {
    fs.copyFileSync(econDataFile, econDataBackupFile);
    console.log(`✅ Created backup of econ-data.js`);
  }
  
  // Replace the file with a clean minimal version
  const content = fs.readFileSync(econDataFile, 'utf8');
  
  if (content.includes('gold-exchange-rate-data') || 
      content.includes('/* Using 5-year data from API */')) {
    
    console.log('⚠️ Found problematic changes in econ-data.js, restoring from backup');
    
    if (fs.existsSync(econDataBackupFile)) {
      fs.copyFileSync(econDataBackupFile, econDataFile);
      console.log('✅ Restored econ-data.js from backup');
    }
  }
}

// Check for index.html changes that might have broken the site
console.log('\n6️⃣ Checking index.html...');

const indexFiles = [
  './newfrontend/index.html',
  './index.html'
];

indexFiles.forEach(indexFile => {
  if (fs.existsSync(indexFile)) {
    // Create a backup if one doesn't exist
    const indexBackupFile = `${indexFile}.original`;
    
    if (!fs.existsSync(indexBackupFile)) {
      fs.copyFileSync(indexFile, indexBackupFile);
      console.log(`✅ Created backup of ${indexFile}`);
    }
  }
});

// Try to find a more sophisticated version of index.html
const findFullIndexHtml = () => {
  const possibleLocations = [
    './Frontend/index.html',
    './Frontend-backup/index.html',
    './newfrontend/index.html.original',
    './index.html.original'
  ];
  
  for (const loc of possibleLocations) {
    if (fs.existsSync(loc)) {
      return loc;
    }
  }
  
  return null;
};

const fullIndexHtml = findFullIndexHtml();
if (fullIndexHtml) {
  console.log(`\n✅ Found what appears to be the complete index.html at ${fullIndexHtml}`);
  console.log('Copying this to newfrontend/index.html');
  
  // Ensure newfrontend directory exists
  if (!fs.existsSync('./newfrontend')) {
    fs.mkdirSync('./newfrontend', { recursive: true });
  }
  
  fs.copyFileSync(fullIndexHtml, './newfrontend/index.html');
}

// Create a minimal fallback handler
console.log('\n7️⃣ Creating fallback script to ensure basic functionality...');

const fallbackScript = `// Basic functionality restoration
document.addEventListener('DOMContentLoaded', function() {
  console.log('Fallback script loaded');
  
  // Find all buttons and add basic click handlers
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      console.log('Button clicked:', this.textContent);
      
      // Try to handle navigation buttons
      if (this.getAttribute('data-target') || this.getAttribute('href')) {
        const target = this.getAttribute('data-target') || this.getAttribute('href');
        if (target && document.querySelector(target)) {
          e.preventDefault();
          document.querySelector(target).scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
  
  // Add fallback for any tabs
  const tabLinks = document.querySelectorAll('[data-tab]');
  tabLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetTab = this.getAttribute('data-tab');
      
      // Hide all tab content
      document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
      });
      
      // Show target tab
      if (document.querySelector(targetTab)) {
        document.querySelector(targetTab).style.display = 'block';
      }
      
      // Update active state
      tabLinks.forEach(tl => tl.classList.remove('active'));
      this.classList.add('active');
    });
  });
});`;

fs.writeFileSync('./newfrontend/js/fallback.js', fallbackScript);
console.log('✅ Created fallback script at ./newfrontend/js/fallback.js');

// Look for the safest working version of the gold chart code
console.log('\n8️⃣ Looking for working versions of the gold chart code...');

// Files to check for chart code
const chartFiles = [
  './newfrontend/js/econ-data.js',
  './newfrontend/js/econ-data.js.original',
  './Frontend/js/econ-data.js'
];

let foundWorkingChart = false;

for (const file of chartFiles) {
  if (fs.existsSync(file)) {
    console.log(`Found chart file: ${file}`);
    foundWorkingChart = true;
    
    // If it's not already in the right place, copy it
    if (file !== './newfrontend/js/econ-data.js') {
      fs.copyFileSync(file, './newfrontend/js/econ-data.js');
      console.log(`✅ Copied ${file} to ./newfrontend/js/econ-data.js`);
    }
    
    break;
  }
}

if (!foundWorkingChart) {
  console.log('❌ Could not find a working version of the chart code');
}

console.log('\n✅ Recovery attempts completed!');
console.log('\nNext steps:');
console.log('1. Check for any errors above');
console.log('2. Deploy to Vercel again: npx vercel --prod');
console.log('3. If issues persist, consider restoring from a known good backup');
