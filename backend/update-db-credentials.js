const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt for existing PostgreSQL credentials
console.log('Update Database Credentials');
console.log('--------------------------');
console.log('This script will update your .env file with your existing PostgreSQL credentials.');
console.log('');

const questions = [
  { name: 'DB_USER', question: 'Enter your PostgreSQL username: ', default: '' },
  { name: 'DB_PASSWORD', question: 'Enter your PostgreSQL password: ', default: '' },
  { name: 'DB_NAME', question: 'Enter database name (or create new one): ', default: 'portfolio_db' },
  { name: 'DB_HOST', question: 'Enter database host: ', default: 'localhost' },
  { name: 'DB_PORT', question: 'Enter database port: ', default: '5432' }
];

async function promptQuestions() {
  const answers = {};
  
  for (const q of questions) {
    const answer = await new Promise(resolve => {
      rl.question(`${q.question}${q.default ? ` (${q.default})` : ''} `, (input) => {
        resolve(input || q.default);
      });
    });
    
    answers[q.name] = answer;
  }
  
  return answers;
}

async function updateEnvFile(credentials) {
  const envFilePath = path.join(__dirname, '.env');
  let envContent = '';
  
  // Read existing content or create new
  try {
    if (fs.existsSync(envFilePath)) {
      envContent = fs.readFileSync(envFilePath, 'utf8');
    }
  } catch (error) {
    console.error('Error reading .env file:', error.message);
  }
  
  // Update each value in the .env content
  Object.keys(credentials).forEach(key => {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    const newLine = `${key}=${credentials[key]}`;
    
    if (regex.test(envContent)) {
      // Replace existing line
      envContent = envContent.replace(regex, newLine);
    } else {
      // Add new line
      envContent += `\n${newLine}`;
    }
  });
  
  // Add PORT if it doesn't exist
  if (!/^PORT=.*$/m.test(envContent)) {
    envContent += '\nPORT=3000';
  }
  
  // Write back to .env file
  try {
    fs.writeFileSync(envFilePath, envContent.trim());
    console.log('\nCredentials updated successfully in .env file');
  } catch (error) {
    console.error('Error writing .env file:', error.message);
  }
}

async function main() {
  try {
    const credentials = await promptQuestions();
    await updateEnvFile(credentials);
    
    console.log('\nNext steps:');
    console.log('1. Run database connection test: node db-connection-test.js');
    console.log('2. If successful, set up your database: npm run setup');
    console.log('3. Start the API server: npm start');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    rl.close();
  }
}

main();
