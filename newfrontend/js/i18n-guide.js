/**
 * Internationalization File Organization
 * 
 * Script to properly organize .mo and .po translation files
 */

const fs = require('fs');
const path = require('path');

// Define paths
const ROOT_DIR = __dirname;
const FRONTEND_I18N_DIR = path.join(ROOT_DIR, 'Frontend', 'i18n');
const BACKEND_I18N_DIR = path.join(ROOT_DIR, 'Backend', 'i18n');

// Create organization structure
function organizeI18nFiles() {
  console.log('🌐 Organizing internationalization files...');
  
  // Create directories if they don't exist
  [FRONTEND_I18N_DIR, BACKEND_I18N_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
  
  // Search for .mo and .po files
  const moFiles = findFiles(ROOT_DIR, /\.(mo|po)$/);
  console.log(`Found ${moFiles.length} internationalization files`);
  
  // Organize files
  moFiles.forEach(file => {
    const fileName = path.basename(file);
    const isBackend = file.includes('backend') || 
                      file.includes('Backend') || 
                      file.includes('server') ||
                      file.includes('api');
    
    // Determine destination
    const destDir = isBackend ? BACKEND_I18N_DIR : FRONTEND_I18N_DIR;
    
    // Create language subfolder based on filename
    // Example: humanize-fr.mo goes to i18n/fr/
    let langCode = 'en'; // Default
    const langMatch = fileName.match(/[_-]([a-z]{2})\./i);
    if (langMatch && langMatch[1]) {
      langCode = langMatch[1].toLowerCase();
    }
    
    const langDir = path.join(destDir, langCode);
    if (!fs.existsSync(langDir)) {
      fs.mkdirSync(langDir, { recursive: true });
    }
    
    // Copy file to destination
    const destPath = path.join(langDir, fileName);
    try {
      fs.copyFileSync(file, destPath);
      console.log(`✓ Copied ${fileName} to ${path.relative(ROOT_DIR, destPath)}`);
    } catch (err) {
      console.error(`✗ Error copying ${fileName}: ${err.message}`);
    }
  });
  
  console.log('🌐 Internationalization files organization complete!');
  console.log('\nStandard structure created:');
  console.log('- Frontend/i18n/{language_code}/humanize.mo');
  console.log('- Backend/i18n/{language_code}/humanize.mo');
}

// Find files recursively
function findFiles(dir, pattern) {
  let results = [];
  
  function scan(directory) {
    try {
      const files = fs.readdirSync(directory);
      
      for (const file of files) {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip node_modules and .git
          if (file !== 'node_modules' && file !== '.git') {
            scan(fullPath);
          }
        } else if (pattern.test(file)) {
          results.push(fullPath);
        }
      }
    } catch (err) {
      console.error(`Error scanning directory ${directory}: ${err.message}`);
    }
  }
  
  scan(dir);
  return results;
}

// Run the organization
organizeI18nFiles();

/**
 * RECOMMENDED STRUCTURE FOR INTERNATIONALIZATION FILES
 * 
 * Frontend/
 * └── i18n/
 *     ├── en/
 *     │   ├── humanize.mo
 *     │   └── client.mo
 *     ├── fr/
 *     │   ├── humanize.mo
 *     │   └── client.mo
 *     └── es/
 *         ├── humanize.mo
 *         └── client.mo
 * 
 * Backend/
 * └── i18n/
 *     ├── en/
 *     │   ├── humanize.mo
 *     │   └── server.mo
 *     ├── fr/
 *     │   ├── humanize.mo
 *     │   └── server.mo
 *     └── es/
 *         ├── humanize.mo
 *         └── server.mo
 */

// Export a function to initialize i18n in frontend/backend code
module.exports = {
  initializeI18n: function(language = 'en') {
    console.log(`Initializing i18n with language: ${language}`);
    // Implementation would depend on your i18n library
    return {
      t: function(key) {
        // Simple translation function stub
        return key; // In real implementation, would return translated string
      }
    };
  }
};

// Sample code for using i18n in a frontend component:
/*
const i18n = require('./i18n-guide');
const translator = i18n.initializeI18n('en');

// Translate string
const message = translator.t('Welcome to my portfolio!');
*/
