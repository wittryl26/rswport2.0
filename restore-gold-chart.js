// Simple script to restore original file
const fs = require('fs');
try {
  fs.copyFileSync('./newfrontend/js/modern-charts.js.backup-1741658918601', './newfrontend/js/modern-charts.js');
  console.log('Successfully restored file from backup');
} catch (err) {
  console.error('Error restoring file:', err.message);
}