const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

console.log('🚀 Vercel Deployment Helper');

// Check if vercel CLI is installed globally
function isVercelInstalled() {
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    return true;
  } catch (err) {
    return false;
  }
}

// Check if npx is available
function isNpxAvailable() {
  try {
    execSync('npx --version', { stdio: 'pipe' });
    return true;
  } catch (err) {
    return false;
  }
}

// Main function
async function deploy() {
  console.log('\n1️⃣ Checking deployment requirements...');
  
  // Read vercel.json to confirm configuration
  try {
    const vercelConfig = JSON.parse(fs.readFileSync('./vercel.json', 'utf8'));
    console.log(`✅ vercel.json found - outputDirectory: ${vercelConfig.outputDirectory}`);
    
    // Check if we have the required directories
    const outputDirExists = fs.existsSync(`./${vercelConfig.outputDirectory}`);
    if (!outputDirExists) {
      console.error(`❌ Output directory "${vercelConfig.outputDirectory}" not found!`);
      return;
    }
    
    // Check if server.js exists
    const serverPath = './server.js';
    const backendServerPath = './backend/server.js';
    const serverExists = fs.existsSync(serverPath);
    const backendServerExists = fs.existsSync(backendServerPath);
    
    if (!serverExists && !backendServerExists) {
      console.error('❌ No server.js found in root or backend directory!');
      return;
    }
    
    console.log(`✅ Server file found: ${serverExists ? serverPath : backendServerPath}`);
    console.log(`✅ Output directory found: ${vercelConfig.outputDirectory}`);
  } catch (err) {
    console.error(`❌ Error reading vercel.json: ${err.message}`);
    return;
  }
  
  // Check if vercel is installed
  console.log('\n2️⃣ Checking for Vercel CLI...');
  const vercelGloballyInstalled = isVercelInstalled();
  const npxAvailable = isNpxAvailable();
  
  if (vercelGloballyInstalled) {
    console.log('✅ Vercel CLI is installed globally');
  } else if (npxAvailable) {
    console.log('✅ Vercel CLI not found globally, but npx is available as an alternative');
  } else {
    console.log('❌ Neither Vercel CLI nor npx are available');
    console.log('\nTo install Vercel CLI globally:');
    console.log('  npm i -g vercel');
    console.log('\nAlternatively, you can deploy directly from the Vercel website:');
    console.log('  1. Visit https://vercel.com/import');
    console.log('  2. Connect your GitHub repository');
    console.log('  3. Follow the deployment steps');
    return;
  }
  
  console.log('\n3️⃣ Preparing for deployment...');
  
  // Make sure all changes are committed
  try {
    const status = execSync('git status --porcelain').toString();
    if (status.trim()) {
      console.log('⚠️ You have uncommitted changes. Consider committing them first:');
      console.log('  git add .');
      console.log('  git commit -m "Pre-deployment updates"');
      console.log('  git push');
      
      console.log('\n🔄 Proceeding with deployment anyway in 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    } else {
      console.log('✅ All changes are committed');
    }
  } catch (err) {
    console.log('⚠️ Could not check git status.');
  }
  
  console.log('\n4️⃣ Deploying to Vercel...');
  
  try {
    // Use the appropriate command for deployment
    if (vercelGloballyInstalled) {
      console.log('Running: vercel --prod');
      
      // Use spawn to allow interactive authentication if needed
      const vercelProcess = spawn('vercel', ['--prod'], { 
        stdio: 'inherit',
        shell: true
      });
      
      vercelProcess.on('exit', (code) => {
        if (code === 0) {
          console.log('\n✅ Deployment successful!');
        } else {
          console.error(`\n❌ Deployment failed with exit code ${code}`);
          console.log('\nAlternative deployment methods:');
          console.log('1. Try using npx: npx vercel --prod');
          console.log('2. Deploy from the Vercel dashboard: https://vercel.com/dashboard');
        }
      });
    } else if (npxAvailable) {
      console.log('Running: npx vercel --prod');
      
      const npxProcess = spawn('npx', ['vercel', '--prod'], {
        stdio: 'inherit',
        shell: true
      });
      
      npxProcess.on('exit', (code) => {
        if (code === 0) {
          console.log('\n✅ Deployment successful!');
        } else {
          console.error(`\n❌ Deployment failed with exit code ${code}`);
          console.log('\nYou may need to install Vercel globally or deploy from the dashboard:');
          console.log('npm i -g vercel  # Install globally');
          console.log('# OR');
          console.log('Visit: https://vercel.com/dashboard  # Deploy from dashboard');
        }
      });
    }
  } catch (err) {
    console.error(`❌ Error during deployment: ${err.message}`);
  }
}

// Run the deployment
deploy().catch(err => {
  console.error(`Deployment error: ${err.message}`);
});
