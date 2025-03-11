// Gold Price vs. Exchange Rate Chart Data API
// Provides 5-year data range for chart visualization

const fs = require('fs');
const path = require('path');

// Try to find all possible data files
const findGoldDataFiles = () => {
  const directories = [
    path.join(process.cwd(), 'newfrontend/data'),
    path.join(process.cwd(), 'backend/data')
  ];
  
  const possibleFileNames = [
    'gold_rupee_data.json',
    'gold-rupee-data.json',
    'gold_price_data.json',
    'exchange_rate_data.json',
    'gold_inr_data.json',
    'gold_usd_inr.json'
  ];
  
  // Search all directories for any of the possible files
  for (const dir of directories) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      
      // First check for exact file name matches
      for (const fileName of possibleFileNames) {
        if (files.includes(fileName)) {
          return path.join(dir, fileName);
        }
      }
      
      // Then check for keyword matches in file names
      const keywords = ['gold', 'rupee', 'inr', 'exchange'];
      for (const file of files) {
        if (file.endsWith('.json') && 
            keywords.some(keyword => file.toLowerCase().includes(keyword))) {
          return path.join(dir, file);
        }
      }
    }
  }
  
  return null;
};

// Get data with 5-year range
const getGoldExchangeRateData = () => {
  // Try to find the data file
  const dataFile = findGoldDataFiles();
  
  if (!dataFile) {
    console.error('No gold/exchange rate data file found');
    return { error: 'Data file not found' };
  }
  
  try {
    console.log(`Using data file: ${dataFile}`);
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    
    // Calculate 5 years ago
    const now = new Date();
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(now.getFullYear() - 5);
    
    // Handle different data formats
    if (Array.isArray(data)) {
      // Simple array of objects format
      if (data.length > 0 && data[0].date) {
        return data.filter(item => new Date(item.date) >= fiveYearsAgo);
      }
      return data; // Return as is if we can't filter
    }
    
    // Handle object with separate goldData and rupeeData arrays
    if (data.goldData && Array.isArray(data.goldData)) {
      return {
        goldData: data.goldData.filter(item => 
          item.date && new Date(item.date) >= fiveYearsAgo
        ),
        rupeeData: data.rupeeData && Array.isArray(data.rupeeData) 
          ? data.rupeeData.filter(item => item.date && new Date(item.date) >= fiveYearsAgo)
          : []
      };
    }
    
    // Handle any other data structure that might be used
    return data;
  } catch (err) {
    console.error(`Error processing data file: ${err.message}`);
    return { error: err.message };
  }
};

// API handler
module.exports = (req, res) => {
  try {
    const data = getGoldExchangeRateData();
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    // Return the data with proper 5-year range
    res.status(200).json(data);
  } catch (err) {
    console.error(`Error in gold exchange rate API: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};