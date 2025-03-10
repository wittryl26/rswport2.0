const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Backup configuration
const config = {
  sourceDirectories: [
    '/C:/backend',
    '/C:/portfolio-frontend',
    '/c:/Frontend'
  ],
  backupRoot: '/C:/backups',
  excludePatterns: [
    'node_modules',
    '.git',
    '.env',
    'dist',
    'build'
  ]
};

// Create a timestamped backup folder
const createBackup = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(config.backupRoot, `backup-${timestamp}`);
  
  // Create backup directory if it doesn't exist
  if (!fs.existsSync(config.backupRoot)) {
    fs.mkdirSync(config.backupRoot, { recursive: true });
  }
  
  fs.mkdirSync(backupDir, { recursive: true });
  console.log(`Created backup directory: ${backupDir}`);
  
  // Backup each source directory
  config.sourceDirectories.forEach(sourceDir => {
    if (fs.existsSync(sourceDir)) {
      const dirName = path.basename(sourceDir);
      const destDir = path.join(backupDir, dirName);
      
      // Create corresponding directory in backup
      fs.mkdirSync(destDir, { recursive: true });
      
      // Build exclude patterns for copy command
      const excludes = config.excludePatterns
        .map(pattern => `--exclude="${pattern}"`)
        .join(' ');
      
      // For Windows, use robocopy or xcopy
      if (process.platform === 'win32') {
        const command = `robocopy "${sourceDir}" "${destDir}" /E /NFL /NDL ${config.excludePatterns.map(p => `/XD ${p}`).join(' ')}`;
        exec(command, (error, stdout, stderr) => {
          if (error && error.code !== 1) {
            // Robocopy returns 1 if files were copied successfully
            console.error(`Error backing up ${sourceDir}: ${stderr}`);
          } else {
            console.log(`Successfully backed up ${sourceDir} to ${destDir}`);
          }
        });
      } else {
        // For Unix-like systems, use rsync
        const command = `rsync -a ${excludes} "${sourceDir}/" "${destDir}"`;
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error backing up ${sourceDir}: ${stderr}`);
          } else {
            console.log(`Successfully backed up ${sourceDir} to ${destDir}`);
          }
        });
      }
    } else {
      console.log(`Source directory does not exist: ${sourceDir}`);
    }
  });
  
  return backupDir;
};

// Run backup
const backupDir = createBackup();
console.log(`Backup completed to: ${backupDir}`);
