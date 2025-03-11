const fs = require('fs');
const path = require('path');

console.log('🔄 Restoring content to newfrontend directory');

// Check if Frontend directory exists (source of content)
const frontendExists = fs.existsSync('./Frontend');
const newfrontendExists = fs.existsSync('./newfrontend');

if (!frontendExists) {
  console.error('❌ Original Frontend directory not found. Cannot restore content.');
  process.exit(1);
}

if (!newfrontendExists) {
  console.log('Creating newfrontend directory...');
  fs.mkdirSync('./newfrontend', { recursive: true });
}

console.log('\n1️⃣ Copying content from Frontend to newfrontend...');

// Function to copy directory recursively
function copyDirectory(source, destination) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
    console.log(`Created directory: ${destination}`);
  }

  // Get all files and directories in the source
  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);

    // Skip .git directories
    if (entry.name === '.git' || entry.name === 'node_modules') {
      continue;
    }

    if (entry.isDirectory()) {
      // Recursively copy directories
      copyDirectory(sourcePath, destPath);
    } else {
      // Copy files
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied: ${sourcePath} -> ${destPath}`);
    }
  }
}

// Copy all files from Frontend to newfrontend
copyDirectory('./Frontend', './newfrontend');

console.log('\n2️⃣ Creating a proper index.html in newfrontend...');

// Create a proper index.html with proper imports
const properIndexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ryland Wittman Portfolio</title>
  <link rel="stylesheet" href="css/styles.css">
  <link rel="stylesheet" href="css/modern-styles.css">
</head>
<body>
  <header>
    <div class="container">
      <h1>Ryland Wittman</h1>
      <nav>
        <ul>
          <li><a href="#about">About</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#financial-models">Financial Models</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main>
    <section id="hero" class="container">
      <h2>Portfolio</h2>
      <p>Financial modeling, data analysis, and technology solutions</p>
    </section>

    <section id="about" class="container">
      <h2>About Me</h2>
      <div class="about-content">
        <p>Welcome to my portfolio site. I specialize in financial analysis, data modeling, and technical solutions.</p>
      </div>
    </section>

    <section id="projects" class="container">
      <h2>Projects</h2>
      <div class="projects-grid" id="projects-container">
        <!-- Projects will be loaded dynamically -->
        <div class="project-card">
          <h3>Financial Analysis Dashboard</h3>
          <p>Interactive dashboard for financial data visualization and analysis.</p>
        </div>
        <div class="project-card">
          <h3>Economic Data Integration</h3>
          <p>System to collect and analyze economic indicators and trends.</p>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="container">
      <p>&copy; 2023 Ryland Wittman. All rights reserved.</p>
    </div>
  </footer>

  <!-- Scripts -->
  <script src="js/script.js"></script>
  <script src="js/create-project-cards.js"></script>

  <script>
    // Load correct stylesheets and scripts based on availability
    const loadResource = (type, path) => {
      return new Promise((resolve, reject) => {
        if (type === 'style') {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = path;
          link.onload = resolve;
          link.onerror = reject;
          document.head.appendChild(link);
        } else if (type === 'script') {
          const script = document.createElement('script');
          script.src = path;
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        }
      });
    };

    // Try to load various scripts and styles
    const resources = [
      { type: 'style', path: 'css/financial-tabs.css' },
      { type: 'style', path: 'css/financial-spreadsheet.css' },
      { type: 'script', path: 'js/api-config.js' },
      { type: 'script', path: 'js/api-service.js' },
      { type: 'script', path: 'js/financial.js' },
      { type: 'script', path: 'js/econ-data.js' }
    ];

    resources.forEach(res => {
      loadResource(res.type, res.path).catch(err => {
        console.log(\`Resource not found: \${res.path}\`);
      });
    });

    // Log when page is fully loaded
    window.addEventListener('load', () => {
      console.log('Page fully loaded');
    });
  </script>
</body>
</html>`;

fs.writeFileSync('./newfrontend/index.html', properIndexHtml);
console.log('✅ Created full index.html with proper structure');

console.log('\n3️⃣ Ensuring necessary directories exist in newfrontend...');

// Make sure necessary directories exist in newfrontend
const requiredDirs = [
  'css',
  'js',
  'data',
  'static',
  'static/images',
];

requiredDirs.forEach(dir => {
  const dirPath = path.join('./newfrontend', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
});

// Ensure CSS and JS directories have at least minimal files
const minimumCssContent = `/* Basic styles */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  margin: 0;
  padding: 0;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

header {
  background-color: #f8f9fa;
  padding: 20px 0;
  border-bottom: 1px solid #e9ecef;
}

nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
}

nav ul li {
  margin-right: 20px;
}

nav a {
  text-decoration: none;
  color: #495057;
}

section {
  margin: 40px 0;
}

footer {
  background-color: #f8f9fa;
  padding: 20px 0;
  border-top: 1px solid #e9ecef;
  margin-top: 40px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.project-card {
  border: 1px solid #e9ecef;
  border-radius: 5px;
  padding: 20px;
  background-color: #fff;
}
`;

const minimumJsContent = `// Basic functionality
document.addEventListener('DOMContentLoaded', function() {
  console.log('Portfolio site loaded');
  
  // Add basic interactivity
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      document.querySelector(targetId).scrollIntoView({ 
        behavior: 'smooth' 
      });
    });
  });
});
`;

// Ensure minimum CSS exists
if (!fs.existsSync('./newfrontend/css/styles.css')) {
  fs.writeFileSync('./newfrontend/css/styles.css', minimumCssContent);
  console.log('Created minimal styles.css');
}

// Ensure minimum JS exists
if (!fs.existsSync('./newfrontend/js/script.js')) {
  fs.writeFileSync('./newfrontend/js/script.js', minimumJsContent);
  console.log('Created minimal script.js');
}

console.log('\n4️⃣ Checking vercel.json configuration...');

// Ensure vercel.json is correct
let vercelConfig;
try {
  vercelConfig = JSON.parse(fs.readFileSync('./vercel.json', 'utf8'));
  let vercelUpdated = false;
  
  // Check outputDirectory
  if (vercelConfig.outputDirectory !== 'newfrontend') {
    vercelConfig.outputDirectory = 'newfrontend';
    vercelUpdated = true;
    console.log('Updated outputDirectory to newfrontend');
  }
  
  // Check routes
  if (vercelConfig.routes) {
    for (let i = 0; i < vercelConfig.routes.length; i++) {
      const route = vercelConfig.routes[i];
      
      // Fix any reference to Frontend in routes
      if (route.dest && route.dest.includes('Frontend')) {
        vercelConfig.routes[i].dest = route.dest.replace(/Frontend/g, 'newfrontend');
        vercelUpdated = true;
        console.log(`Updated route dest: ${route.dest} -> ${vercelConfig.routes[i].dest}`);
      }
    }
  }
  
  // Check builds
  if (vercelConfig.builds) {
    for (let i = 0; i < vercelConfig.builds.length; i++) {
      const build = vercelConfig.builds[i];
      
      // Fix any reference to Frontend in builds
      if (build.src && build.src.includes('Frontend')) {
        vercelConfig.builds[i].src = build.src.replace(/Frontend/g, 'newfrontend');
        vercelUpdated = true;
        console.log(`Updated build src: ${build.src} -> ${vercelConfig.builds[i].src}`);
      }
    }
  }
  
  // Save updated vercel.json if needed
  if (vercelUpdated) {
    fs.writeFileSync('./vercel.json', JSON.stringify(vercelConfig, null, 2));
    console.log('✅ Saved updated vercel.json configuration');
  } else {
    console.log('✅ vercel.json configuration is correct');
  }
} catch (err) {
  console.error(`❌ Error checking vercel.json: ${err.message}`);
}

console.log('\n✅ Content restoration complete!');
console.log('\nNext steps:');
console.log('1. Add the changes to Git: git add .');
console.log('2. Commit the changes: git commit -m "Restore content to newfrontend"');
console.log('3. Push to GitHub: git push');
console.log('4. Deploy to Vercel: npx vercel --prod');
console.log('\nYour site should now load with the proper content after deployment.');
