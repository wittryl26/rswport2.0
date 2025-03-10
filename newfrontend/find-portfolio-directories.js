const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔍 Finding portfolio-related directories...');

// Function to run a command and get output
function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        return reject(error);
      }
      resolve(stdout.trim());
    });
  });
}

// Function to check common locations
async function checkCommonLocations() {
  console.log('\nChecking common locations...');
  
  const commonLocations = [
    'C:/',
    'C:/Users',
    'C:/Program Files',
    'C:/Program Files (x86)',
    'C:/backend',
    'C:/Frontend'
  ];
  
  for (const location of commonLocations) {
    if (fs.existsSync(location)) {
      try {
        // List direct subdirectories
        const entries = fs.readdirSync(location, { withFileTypes: true });
        
        for (const entry of entries) {
          if (entry.isDirectory() && entry.name.toLowerCase().includes('portfolio')) {
            console.log(`Found: ${path.join(location, entry.name)}`);
          }
        }
      } catch (err) {
        console.log(`Could not read ${location}: ${err.message}`);
      }
    }
  }
}

// Find portfolio directories using dir command (Windows specific)
async function findPortfolioDirs() {
  console.log('\nSearching C: drive for portfolio directories (this may take a while)...');
  
  try {
    // Use Windows dir command to search for directories containing "portfolio"
    const command = 'dir C:\\*portfolio* /s /b /ad';
    const dirs = await runCommand(command);
    
    if (dirs) {
      const dirList = dirs.split('\n').filter(Boolean);
      console.log('\nFound the following portfolio directories:');
      dirList.forEach((dir, index) => {
        console.log(`${index + 1}. ${dir}`);
      });
    } else {
      console.log('No portfolio directories found by name search.');
    }
  } catch (error) {
    console.log('Error searching for directories:', error);
  }
}

// Drive letter to start from
const rootDrive = 'C:';

// Main function
async function main() {
  console.log(`Searching for portfolio-related directories on ${rootDrive} drive...`);
  
  // Check if the expected path exists
  if (fs.existsSync('C:/portfolio-frontend')) {
    console.log('\nThe directory C:/portfolio-frontend exists!');
  } else {
    console.log('\nThe directory C:/portfolio-frontend does not exist.');
  }
  
  // Check for variations
  const variations = [
    'C:\\portfolio-frontend',
    'C:/portfolio-frontend/',
    'C:\\portfolio-frontend\\',
    '/portfolio-frontend',
    'portfolio-frontend'
  ];
  
  variations.forEach(variant => {
    if (fs.existsSync(variant)) {
      console.log(`Found variant: ${variant}`);
    }
  });
  
  // Check common locations
  await checkCommonLocations();
  
  // Search for portfolio directories
  await findPortfolioDirs();
  
  console.log('\nSearch complete!');
}

main().catch(err => {
  console.error('Error during search:', err);
});
