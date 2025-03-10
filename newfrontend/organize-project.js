/**
 * Portfolio Project Cleanup & Organization Script
 * 
 * This script helps identify duplicate files and properly organize
 * the portfolio files into Frontend and Backend folders.
 * 
 * Run with: node organize-project.js
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Base directories
const ROOT_DIR = __dirname;
const FRONTEND_DIR = path.join(ROOT_DIR, 'Frontend');
const BACKEND_DIR = path.join(ROOT_DIR, 'Backend');

// Make sure Frontend and Backend directories exist
function ensureDirectories() {
  if (!fs.existsSync(FRONTEND_DIR)) {
    fs.mkdirSync(FRONTEND_DIR, { recursive: true });
    console.log(`✅ Created Frontend directory at: ${FRONTEND_DIR}`);
  }
  
  if (!fs.existsSync(BACKEND_DIR)) {
    fs.mkdirSync(BACKEND_DIR, { recursive: true });
    console.log(`✅ Created Backend directory at: ${BACKEND_DIR}`);
  }
  
  // Create essential subdirectories
  const frontendSubdirs = ['css', 'js', 'static/images', 'data'];
  const backendSubdirs = ['routes', 'data', 'utils'];
  
  frontendSubdirs.forEach(dir => {
    const fullPath = path.join(FRONTEND_DIR, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✅ Created directory: ${fullPath}`);
    }
  });
  
  backendSubdirs.forEach(dir => {
    const fullPath = path.join(BACKEND_DIR, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✅ Created directory: ${fullPath}`);
    }
  });
}

// Scan directories to find duplicate files
async function findDuplicates() {
  console.log("\n🔍 Scanning for duplicate files...");
  
  // Map to store files by name
  const filesByName = new Map();
  
  // Function to scan directories recursively
  const scanDir = (dir, baseDir) => {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and .git directories
        if (file !== 'node_modules' && file !== '.git') {
          scanDir(fullPath, baseDir);
        }
      } else {
        // Get relative path from the base directory
        const relativePath = path.relative(baseDir, fullPath);
        const fileName = path.basename(file);
        
        // Add to map
        if (!filesByName.has(fileName)) {
          filesByName.set(fileName, []);
        }
        filesByName.get(fileName).push({
          path: fullPath,
          relativePath: relativePath,
          baseDir: baseDir === ROOT_DIR ? 'root' : path.basename(baseDir),
          size: stat.size,
          modified: stat.mtime
        });
      }
    });
  };
  
  // Scan the directories
  scanDir(ROOT_DIR, ROOT_DIR);
  if (fs.existsSync(FRONTEND_DIR)) scanDir(FRONTEND_DIR, FRONTEND_DIR);
  if (fs.existsSync(BACKEND_DIR)) scanDir(BACKEND_DIR, BACKEND_DIR);
  
  // Find duplicates
  const duplicates = [];
  filesByName.forEach((files, name) => {
    if (files.length > 1) {
      duplicates.push({ name, files });
    }
  });
  
  console.log(`Found ${duplicates.length} files with duplicate names.\n`);
  
  return duplicates;
}

// Define where files should be placed
const fileMapping = {
  // HTML files go to Frontend
  'index.html': 'Frontend',
  'resume.html': 'Frontend',
  'financial-model-pdf.html': 'Frontend',
  
  // CSS files go to Frontend/css
  'modern-styles.css': 'Frontend/css',
  'about-me-dropdown.css': 'Frontend/css',
  'bottleneck-predictor.css': 'Frontend/css',
  'financial-card-fix.css': 'Frontend/css',
  'financial-tabs.css': 'Frontend/css',
  'portfolio-architecture.css': 'Frontend/css',
  'scroll-indicator.css': 'Frontend/css',
  'task-management.css': 'Frontend/css',
  
  // Frontend JavaScript files
  'api-config.js': 'Frontend/js',
  'api-service.js': 'Frontend/js',
  'modern-main.js': 'Frontend/js',
  'about-me-dropdown.js': 'Frontend/js',
  'portfolio-architecture.js': 'Frontend/js',
  'chart-customization.js': 'Frontend/js',
  'bottleneck-data-service.js': 'Frontend/js',
  'task-management.js': 'Frontend/js',
  'hero-animation.js': 'Frontend/js',
  'fallback-data.js': 'Frontend/js',
  'single-chart-loader.js': 'Frontend/js',
  'html-financial-model.js': 'Frontend/js',
  'create-project-cards.js': 'Frontend/js',
  'debug-control.js': 'Frontend/js',
  'setup-git.js': 'Frontend',
  'deploy.js': 'Frontend',
  'organize-project.js': 'Frontend',
  
  // Backend files
  'server.js': 'Backend',
  'gold-rupee.js': 'Backend/routes',
  'bottleneck-predictor-live.json': 'Backend/data',
  'security.js': 'Backend/utils',
  'port-finder.js': 'Backend/utils',
  
  // Static data files
  'bottleneck-predictor.json': 'Frontend/data',
  'gold-research.json': 'Frontend/data',
  
  // Documentation
  'content-map.md': 'Frontend/docs',
  'file-organization.md': 'Frontend/docs'
};

// Function to get the proper location for a file
function getProperLocation(fileName) {
  if (fileMapping[fileName]) {
    return fileMapping[fileName];
  }
  
  // For files not explicitly mapped, try to determine based on extension
  const ext = path.extname(fileName).toLowerCase();
  
  if (ext === '.html') return 'Frontend';
  if (ext === '.css') return 'Frontend/css';
  if (ext === '.js' && fileName !== 'server.js') return 'Frontend/js';
  if (ext === '.jpg' || ext === '.png' || ext === '.gif') return 'Frontend/static/images';
  if (ext === '.json' && !fileName.includes('package') && !fileName.includes('-live')) return 'Frontend/data';
  
  // Default for unknown files
  return 'Frontend/misc';
}

// Process duplicates and organize files
async function processDuplicates(duplicates) {
  console.log("⚙️ Processing duplicate files...\n");
  
  for (const { name, files } of duplicates) {
    console.log(`📄 File: ${name}`);
    
    // Get proper location for this file
    const properLocation = getProperLocation(name);
    
    // Sort files by modification time (newest first)
    files.sort((a, b) => b.modified - a.modified);
    
    // Find a file that's already in the proper location
    const inProperLocation = files.find(f => f.path.includes(properLocation));
    
    // If a file is already in the proper location, keep that one
    const fileToKeep = inProperLocation || files[0]; // Keep newest otherwise
    
    console.log(`  Target location: ${properLocation}`);
    
    // Display files with recommendation
    files.forEach((file, index) => {
      const isKeeper = file === fileToKeep;
      console.log(
        `  ${index + 1}. [${file.baseDir}] ${file.relativePath} ` +
        `(${formatSize(file.size)}, ${formatDate(file.modified)}) ` +
        `${isKeeper ? '✅ KEEP' : '❌ DUPLICATE'}`
      );
    });
    
    // Ask user for confirmation
    const action = await askQuestion(`  What do you want to do with ${name}? [keep/skip/manual] `);
    
    if (action.toLowerCase() === 'skip') {
      console.log("  Skipped.\n");
      continue;
    }
    
    if (action.toLowerCase() === 'manual') {
      // Manual handling
      const keepIndex = await askQuestion(`  Enter the number of the file to keep (1-${files.length}): `);
      const targetFile = files[parseInt(keepIndex) - 1];
      
      if (!targetFile) {
        console.log("  Invalid selection, skipping.");
        continue;
      }
      
      // Move the selected file to proper location
      const targetDir = path.join(ROOT_DIR, properLocation);
      const targetPath = path.join(targetDir, name);
      
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      try {
        fs.copyFileSync(targetFile.path, targetPath);
        console.log(`  ✅ Copied to ${properLocation}/${name}`);
      } catch (err) {
        console.error(`  ❌ Failed to copy file: ${err.message}`);
      }
    } else {
      // Default: keep recommended file
      const targetDir = path.join(ROOT_DIR, properLocation);
      const targetPath = path.join(targetDir, name);
      
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Only copy if needed
      if (fileToKeep.path !== targetPath) {
        try {
          fs.copyFileSync(fileToKeep.path, targetPath);
          console.log(`  ✅ Copied to ${properLocation}/${name}`);
        } catch (err) {
          console.error(`  ❌ Failed to copy file: ${err.message}`);
        }
      } else {
        console.log(`  ✅ Already in correct location`);
      }
    }
    
    console.log(''); // Add line break
  }
}

// Function to organize non-duplicate files
async function organizeNonDuplicates() {
  console.log("\n🔍 Organizing non-duplicate files...");
  
  // Get all files in the root directory
  const rootFiles = fs.readdirSync(ROOT_DIR).filter(file => {
    const fullPath = path.join(ROOT_DIR, file);
    const isDirectory = fs.statSync(fullPath).isDirectory();
    
    // Skip directories like node_modules, .git, Frontend, and Backend
    return !isDirectory || 
           (file !== 'node_modules' && 
            file !== '.git' && 
            file !== 'Frontend' && 
            file !== 'Backend');
  });
  
  for (const file of rootFiles) {
    const fullPath = path.join(ROOT_DIR, file);
    
    // Skip directories
    if (fs.statSync(fullPath).isDirectory()) {
      continue;
    }
    
    const properLocation = getProperLocation(file);
    const targetDir = path.join(ROOT_DIR, properLocation);
    const targetPath = path.join(targetDir, file);
    
    console.log(`📄 File: ${file}`);
    console.log(`  Target location: ${properLocation}`);
    
    const action = await askQuestion(`  Move '${file}' to ${properLocation}? [y/n] `);
    
    if (action.toLowerCase() === 'y') {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      try {
        fs.copyFileSync(fullPath, targetPath);
        console.log(`  ✅ Copied to ${properLocation}/${file}`);
      } catch (err) {
        console.error(`  ❌ Failed to copy file: ${err.message}`);
      }
    } else {
      console.log("  Skipped.");
    }
  }
}

// Helper function to ask a question
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Helper function to format file size
function formatSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}

// Helper function to format date
function formatDate(date) {
  return new Date(date).toLocaleString();
}

// Main function
async function main() {
  console.log('🚀 Starting portfolio project organization...');
  
  // Ensure directories exist
  ensureDirectories();
  
  // Find duplicate files
  const duplicates = await findDuplicates();
  
  if (duplicates.length > 0) {
    await processDuplicates(duplicates);
  } else {
    console.log('No duplicates found!');
  }
  
  // Organize remaining files
  await organizeNonDuplicates();
  
  console.log('\n✅ Organization completed!');
  console.log('\nKey files should now be in:');
  console.log('- Frontend/index.html - Main HTML file');
  console.log('- Frontend/css/ - All CSS files');
  console.log('- Frontend/js/ - Frontend JavaScript');
  console.log('- Backend/server.js - API server');
  console.log('- Backend/routes/ - API routes');
  
  rl.close();
}

// Run the script
main().catch(err => {
  console.error('ERROR:', err);
  rl.close();
});
