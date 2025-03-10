const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to run a command and return the output as a promise
function runCommand(command, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command}`);
    
    const child = exec(command, { cwd, maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return reject(error);
      }
      
      resolve(stdout);
    });

    // Stream output in real-time
    child.stdout.on('data', (data) => {
      process.stdout.write(data);
    });

    child.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}

// Function to perform a detailed audit
async function auditPackages(directory) {
  try {
    console.log(`\n📊 ANALYZING VULNERABILITIES IN ${directory} 📊`);
    console.log('='.repeat(60));
    
    // Run npm audit to get JSON output
    const auditOutput = await runCommand('npm audit --json', directory);
    
    try {
      const auditData = JSON.parse(auditOutput);
      
      // Count vulnerabilities by severity
      const vulnerabilities = {
        low: 0,
        moderate: 0,
        high: 0,
        critical: 0
      };
      
      if (auditData.vulnerabilities) {
        Object.values(auditData.vulnerabilities).forEach(vuln => {
          vulnerabilities[vuln.severity]++;
        });
      }
      
      console.log('\n📋 VULNERABILITY SUMMARY');
      console.log('-'.repeat(60));
      console.log(`Critical: ${vulnerabilities.critical}`);
      console.log(`High: ${vulnerabilities.high}`);
      console.log(`Moderate: ${vulnerabilities.moderate}`);
      console.log(`Low: ${vulnerabilities.low}`);
      console.log('-'.repeat(60));
      
      // Most concerning packages (critical and high)
      if (auditData.vulnerabilities) {
        const criticalAndHigh = Object.values(auditData.vulnerabilities)
          .filter(v => v.severity === 'critical' || v.severity === 'high');
          
        if (criticalAndHigh.length > 0) {
          console.log('\n⚠️ CRITICAL AND HIGH SEVERITY ISSUES');
          console.log('-'.repeat(60));
          
          criticalAndHigh.forEach(vuln => {
            console.log(`Package: ${vuln.name}`);
            console.log(`Severity: ${vuln.severity}`);
            console.log(`Vulnerable versions: ${vuln.range}`);
            console.log(`Recommended update: ${vuln.version || 'Not available'}`);
            console.log('-'.repeat(30));
          });
        }
      }
      
    } catch (parseError) {
      console.log('Could not parse audit output as JSON. See raw output above.');
    }
    
    // Run standard audit for readable output
    console.log('\n📝 FULL AUDIT REPORT');
    console.log('-'.repeat(60));
    await runCommand('npm audit', directory);
    
  } catch (error) {
    console.error(`Audit failed: ${error.message}`);
  }
}

// Function to fix vulnerabilities automatically (safe fixes only)
async function fixVulnerabilities(directory) {
  console.log(`\n🔧 ATTEMPTING TO FIX VULNERABILITIES IN ${directory} 🔧`);
  console.log('='.repeat(60));
  console.log('This will only apply fixes that don\'t break dependencies.');
  
  try {
    // First try with --force flag if user approves
    console.log('\n🔄 Running npm audit fix...');
    await runCommand('npm audit fix', directory);
    
    // Check if vulnerabilities remain
    console.log('\n🔄 Checking remaining vulnerabilities...');
    await runCommand('npm audit', directory);
    
    console.log('\n⚠️ Some vulnerabilities may require manual fixes or major version updates.');
    console.log('Run "npm audit fix --force" to attempt more aggressive fixes (may break compatibility).');
    
  } catch (error) {
    console.error(`Fix process failed: ${error.message}`);
  }
}

// Function to update dependencies
async function updateDependencies(directory) {
  console.log(`\n📦 CHECKING FOR DEPENDENCY UPDATES IN ${directory} 📦`);
  console.log('='.repeat(60));
  
  try {
    // Install npm-check-updates if not already installed
    console.log('Installing npm-check-updates...');
    await runCommand('npm install -g npm-check-updates');
    
    // Check for updates
    console.log('\n🔄 Checking for updates (without making changes)...');
    await runCommand('ncu', directory);
    
    // Ask before upgrading
    console.log('\n⚠️ Update carefully! Major version updates may break your app.');
    console.log('If you want to update packages, run: ncu -u && npm install');
    
  } catch (error) {
    console.error(`Update check failed: ${error.message}`);
  }
}

// Main function
async function main() {
  // Define directories to check
  const directories = [
    '/c:/backend',
    '/c:/portfolio-frontend',
    '/c:/Frontend'
  ];
  
  for (const dir of directories) {
    if (fs.existsSync(dir) && fs.existsSync(path.join(dir, 'package.json'))) {
      await auditPackages(dir);
      await fixVulnerabilities(dir);
      await updateDependencies(dir);
    } else {
      console.log(`\nSkipping ${dir} - directory or package.json not found`);
    }
  }
  
  console.log('\n✅ SECURITY AUDIT COMPLETE');
  console.log('='.repeat(60));
  console.log('Remember to test your application thoroughly after making any dependency updates!');
}

main();
