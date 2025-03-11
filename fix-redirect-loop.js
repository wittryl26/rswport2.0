const fs = require('fs');
const path = require('path');

console.log('🔍 Searching for problematic redirects causing reload loops...');

// Directories to search
const directories = [
  '.',
  './newfrontend',
  './api'
];

// File patterns to check
const filePatterns = [
  '.html',
  '.js',
  '.json'
];

// Problematic redirect patterns to look for
const redirectPatterns = [
  { regex: /<meta\s+http-equiv=['"]refresh['"][^>]*>/i, description: 'Meta refresh tag' },
  { regex: /window\.location\.href\s*=/i, description: 'JavaScript location.href redirect' },
  { regex: /window\.location\.replace/i, description: 'JavaScript location.replace redirect' },
  { regex: /window\.location\s*=/i, description: 'JavaScript location redirect' },
  { regex: /<script[^>]*>.*Redirecting to RSW Portfolio.*<\/script>/is, description: 'RSW Portfolio redirect script' },
  { regex: /["']RSW Portfolio["']/i, description: 'RSW Portfolio reference' },
  { regex: /redirect.*portfolio/i, description: 'Redirect to portfolio' },
  { regex: /Redirect|redirect|REDIRECT/i, description: 'Redirect text' }
];

// Add Vercel-specific redirect patterns
const vercelPatterns = [
  { regex: /"source":/i, description: 'Vercel redirect source' },
  { regex: /"destination":/i, description: 'Vercel redirect destination' },
  { regex: /"permanent":\s*true/i, description: 'Vercel permanent redirect' },
  { regex: /"statusCode":/i, description: 'Vercel status code' }
];

// Combine all patterns
const allPatterns = [...redirectPatterns, ...vercelPatterns];

// Find all files matching patterns
function findFiles(dir, patterns) {
  const results = [];
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && file !== 'node_modules' && file !== '.git') {
      // Recursively search subdirectories
      results.push(...findFiles(fullPath, patterns));
    } else if (stat.isFile() && patterns.some(pattern => file.endsWith(pattern))) {
      results.push(fullPath);
    }
  }
  
  return results;
}

// Scan a file for redirect patterns
function scanFileForRedirects(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const findings = [];
    
    allPatterns.forEach(pattern => {
      if (pattern.regex.test(content)) {
        // Find the context (the line containing the match)
        const lines = content.split('\n');
        let matchingLines = [];
        
        for (let i = 0; i < lines.length; i++) {
          if (pattern.regex.test(lines[i])) {
            const startLine = Math.max(0, i - 1);
            const endLine = Math.min(lines.length - 1, i + 1);
            const context = lines.slice(startLine, endLine + 1).join('\n');
            matchingLines.push({ lineNumber: i + 1, context });
          }
        }
        
        findings.push({
          pattern: pattern.description,
          matchingLines
        });
      }
    });
    
    return findings.length > 0 ? findings : null;
  } catch (err) {
    console.error(`Error reading ${filePath}: ${err.message}`);
    return null;
  }
}

// Check if index.html has problematic content
function checkAndFixIndexFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Check for meta refresh
    const metaRefreshMatch = content.match(/<meta\s+http-equiv=['"]refresh['"][^>]*>/i);
    if (metaRefreshMatch) {
      console.log(`⚠️ Found meta refresh tag in ${filePath}. Removing it.`);
      content = content.replace(/<meta\s+http-equiv=['"]refresh['"][^>]*>/i, '');
      modified = true;
    }
    
    // Check for RSW Portfolio redirect script
    if (content.includes('Redirecting to RSW Portfolio') || 
        content.includes('RSW Portfolio') ||
        content.includes('redirect') ||
        content.includes('Redirect')) {
      console.log(`⚠️ Found possible redirect to RSW Portfolio in ${filePath}.`);
      
      // Try to identify and remove the specific redirect script
      const scriptTags = content.match(/<script[^>]*>[\s\S]*?<\/script>/g) || [];
      for (const script of scriptTags) {
        if (script.includes('Redirecting') || 
            script.includes('redirect') || 
            script.includes('RSW Portfolio') ||
            script.includes('window.location')) {
          console.log('Removing problematic script tag:', script.substring(0, 100) + '...');
          content = content.replace(script, '');
          modified = true;
        }
      }
    }
    
    // If we modified the file, write it back
    if (modified) {
      const backupPath = `${filePath}.backup`;
      fs.writeFileSync(backupPath, fs.readFileSync(filePath));
      console.log(`✅ Created backup of original file at ${backupPath}`);
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated ${filePath} - removed problematic redirects`);
      return true;
    }
  } catch (err) {
    console.error(`Error processing ${filePath}: ${err.message}`);
  }
  
  return false;
}

// Main execution
let allFiles = [];
directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    allFiles = [...allFiles, ...findFiles(dir, filePatterns)];
  }
});

console.log(`Found ${allFiles.length} files to scan for redirects`);

// First, check if we need to create a clean index.html
const indexPath = './newfrontend/index.html';
if (!fs.existsSync(indexPath) || checkAndFixIndexFile(indexPath)) {
  console.log('\n⚠️ Creating clean index.html without redirects...');
  
  // Create a clean minimal index.html
  const cleanIndexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ryland Wittman</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      max-width: 800px; 
      margin: 40px auto; 
      padding: 0 20px; 
    }
    h1 { color: #2c3e50; }
    .placeholder { 
      background-color: #f8f9fa; 
      border-radius: 5px; 
      padding: 20px; 
      margin: 20px 0; 
      border-left: 5px solid #007bff; 
    }
  </style>
</head>
<body>
  <h1>Ryland Wittman</h1>
  <div class="placeholder">
    <p>Portfolio site loading...</p>
    <p>If you continue to see this message, the application may still be deploying.</p>
  </div>
  
  <!-- No redirects, no refresh meta tags, no problematic scripts -->
  
  <script>
    // Safe script - just logging to console, no redirects
    console.log('Page loaded successfully');
  </script>
</body>
</html>`;

  fs.writeFileSync(indexPath, cleanIndexHtml);
  console.log(`✅ Created clean index.html at ${indexPath}`);
}

// Scan other files for redirects
console.log('\n🔍 Scanning all files for redirect patterns...');

const problematicFiles = [];

allFiles.forEach(file => {
  const findings = scanFileForRedirects(file);
  if (findings) {
    problematicFiles.push({ file, findings });
  }
});

// Display results
if (problematicFiles.length > 0) {
  console.log(`\n⚠️ Found ${problematicFiles.length} files with potential redirect issues:`);
  
  problematicFiles.forEach(({ file, findings }) => {
    console.log(`\n📄 ${file}:`);
    findings.forEach(finding => {
      console.log(`  • ${finding.pattern}:`);
      finding.matchingLines.forEach(line => {
        console.log(`    Line ${line.lineNumber}: ${line.context.trim().substring(0, 100)}...`);
      });
    });
  });
  
  console.log('\n🛠️ Suggested actions:');
  console.log('1. Review each of the files above for redirect loops');
  console.log('2. Fix or remove any problematic redirects');
  console.log('3. Redeploy to Vercel: npx vercel --prod');
} else {
  console.log('\n✅ No obvious redirect issues found in files');
}

// Check vercel.json for redirects
console.log('\n🔍 Checking vercel.json for problematic redirects...');

try {
  const vercelPath = './vercel.json';
  if (fs.existsSync(vercelPath)) {
    const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
    
    if (vercelConfig.redirects && vercelConfig.redirects.length > 0) {
      console.log(`⚠️ Found ${vercelConfig.redirects.length} redirects in vercel.json:`);
      vercelConfig.redirects.forEach(redirect => {
        console.log(`  • ${redirect.source} → ${redirect.destination}`);
      });
      
      // Create a sanitized version without redirects
      const sanitizedConfig = { ...vercelConfig };
      sanitizedConfig.redirects = [];
      
      fs.writeFileSync('./vercel.sanitized.json', JSON.stringify(sanitizedConfig, null, 2));
      console.log('✅ Created vercel.sanitized.json without redirects');
      console.log('Consider renaming this to vercel.json if needed');
    } else {
      console.log('✅ No explicit redirects in vercel.json');
    }
    
    // Check for permanent redirects in routes
    if (vercelConfig.routes) {
      const redirectRoutes = vercelConfig.routes.filter(route => 
        route.status === 301 || route.status === 302 || 
        (route.headers && route.headers.Location)
      );
      
      if (redirectRoutes.length > 0) {
        console.log(`\n⚠️ Found ${redirectRoutes.length} redirect routes in vercel.json:`);
        redirectRoutes.forEach(route => {
          console.log(`  • ${route.src} → ${route.headers?.Location || route.dest} (status: ${route.status || 'default'})`);
        });
        
        // If we find a Frontend redirect rule, suggest removing it
        const frontendRedirectRule = redirectRoutes.find(route => 
          route.src && route.src.includes('Frontend')
        );
        
        if (frontendRedirectRule) {
          console.log('\n⚠️ Found a Frontend redirect rule that may be causing issues!');
          console.log('Consider removing or updating this rule in vercel.json');
        }
      }
    }
  } else {
    console.log('❌ vercel.json not found');
  }
} catch (err) {
  console.error(`Error checking vercel.json: ${err.message}`);
}

console.log('\n✅ Fix completed!');
console.log('\nNext steps:');
console.log('1. Commit the changes: git add . && git commit -m "Fix redirect loop issues"');
console.log('2. Push changes: git push');
console.log('3. Deploy to Vercel: npx vercel --prod');
