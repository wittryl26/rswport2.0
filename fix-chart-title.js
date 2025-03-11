// Script to update chart x-axis title
const fs = require('fs');

// Path to modern-charts.js
const chartPath = './newfrontend/js/modern-charts.js';

// Check if the file exists
if (fs.existsSync(chartPath)) {
  // Read the file
  let content = fs.readFileSync(chartPath, 'utf8');
  
  // Check if we need to update the x-axis title
  if (content.includes('text: \'2024\'') || 
      content.includes('text: "2024"')) {
    
    // Update the title
    content = content.replace(
      /title:s*{s*display:s*true,s*text:s*['"]2024['"]/g,
      'title: { display: true, text: \'5-Year Range\''
    );
    
    // Save the changes
    fs.writeFileSync(chartPath, content);
    console.log('✅ Updated chart x-axis title to "5-Year Range"');
  } else {
    console.log('Chart title already updated or using a different format');
  }
} else {
  console.log('❌ Could not find modern-charts.js file');
}
