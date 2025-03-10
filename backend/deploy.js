/**
 * Simple deployment script
 * Run with: node deploy.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  frontendDir: path.resolve(__dirname),
  frontendRepo: 'https://github.com/yourusername/portfolio.git',
  apiDir: path.resolve(__dirname, '..', 'portfolio-fred', 'fred-api'),
  apiRepo: 'https://github.com/yourusername/portfolio-api.git'
};

console.log('🚀 Starting deployment process...');

// Deploy frontend
console.log('\n📂 Deploying frontend...');
try {
  process.chdir(config.frontendDir);
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "Update site content - ' + new Date().toISOString() + '"', { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('✅ Frontend deployed successfully!');
} catch (error) {
  console.error('❌ Frontend deployment failed:', error.message);
}

// Deploy backend
console.log('\n📂 Deploying backend API...');
try {
  process.chdir(config.apiDir);
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "Update API - ' + new Date().toISOString() + '"', { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('✅ Backend API deployed successfully!');
} catch (error) {
  console.error('❌ Backend API deployment failed:', error.message);
}

console.log('\n🎉 Deployment complete!');
