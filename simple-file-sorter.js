const fs = require('fs');
const path = require('path');

// Very straightforward categorization by file extension
const frontendExtensions = [
  '.html', '.css', '.scss', '.sass', '.less',
  '.jsx', '.tsx', '.js', '.ts', '.vue', '.svelte',
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
  '.woff', '.woff2', '.ttf', '.eot',
  '.json' // Most JSON files in the root are likely for frontend tools
];

const backendExtensions = [
  '.php', '.rb', '.py', '.java', '.go', '.cs',
  '.env', '.sql', '.sh', '.bash', '.psm1'
];

// Files/directories to ignore
const ignoreList = [
  'node_modules', '.git', 'dist', 'build',
  'Frontend', 'backend', '.github',
  'simple-file-sorter.js', 'file-categories.json'
];

// Backend-specific filenames
const backendFilenames = [
  'server.js', 'app.js', 'api.js', 'routes.js',
  'database.js', 'db.js', 'config.js', 'middleware.js'
];

// Backend-specific directory names
const backendDirs = [
  'routes', 'models', 'controllers', 'middleware',
  'config', 'api', 'database', 'db', 'services'
];

// Frontend-specific directory names
const frontendDirs = [
  'components', 'pages', 'views', 'assets',
  'styles', 'fonts', 'images', 'public'
];

function shouldIgnore(itemPath) {
  return ignoreList.some(item => itemPath.includes(item));
}

function categorizeFile(filePath, isParentBackendDir = false, isParentFrontendDir = false) {
  const ext = path.extname(filePath).toLowerCase();
  const basename = path.basename(filePath);
  
  // If it's in a clear backend directory
  if (isParentBackendDir) {
    return 'backend';
  }
  
  // If it's in a clear frontend directory
  if (isParentFrontendDir) {
    return 'Frontend';
  }
  
  // Check specific backend filenames
  if (backendFilenames.includes(basename)) {
    return 'backend';
  }
  
  // Categorize by extension
  if (frontendExtensions.includes(ext)) {
    return 'Frontend';
  }
  
  if (backendExtensions.includes(ext)) {
    return 'backend';
  }
  
  // Special case for .js files - try to determine by path segments
  if (ext === '.js') {
    const pathParts = filePath.toLowerCase().split(/[\/\\]/);
    
    const hasBackendKeywords = pathParts.some(part => 
      ['server', 'api', 'routes', 'controllers', 'models'].includes(part));
    
    const hasFrontendKeywords = pathParts.some(part => 
      ['components', 'pages', 'ui', 'views', 'public'].includes(part));
    
    if (hasBackendKeywords && !hasFrontendKeywords) return 'backend';
    if (hasFrontendKeywords && !hasBackendKeywords) return 'Frontend';
  }
  
  return 'unknown';
}

function scanDirectory(dir, results = { Frontend: [], backend: [], unknown: [] }) {
  if (shouldIgnore(dir)) return results;
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      
      if (shouldIgnore(fullPath)) continue;
      
      try {
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
                    // Check if this is a known backend or frontend directory
                    const isBackendDir = backendDirs.includes(item.toLowerCase());
                    const isFrontendDir = frontendDirs.includes(item.toLowerCase());
                    
                    scanDirectory(fullPath, results, isBackendDir, isFrontendDir);
                  } else if (stats.isFile()) {
                    const category = categorizeFile(fullPath);
                    results[category].push(fullPath);
                  }
                } catch (err) {
                  console.error(`Error reading item: ${fullPath}`, err);
                }
              }
            } catch (err) {
              console.error(`Error reading directory: ${dir}`, err);
            }
            
            return results;
          }
          
          // Example usage
          const results = scanDirectory('./');
          console.log('Frontend files:', results.Frontend);
          console.log('Backend files:', results.backend);
          console.log('Unknown files:', results.unknown);
          