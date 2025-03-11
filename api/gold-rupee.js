// Gold Price vs. USD/INR Exchange Rate API (Vercel serverless function)
const fs = require('fs');
const path = require('path');

// Find the data file
function findDataFile() {
  const possiblePaths = [
    path.join(process.cwd(), 'newfrontend/data/gold_rupee_data.json'),
    path.join(process.cwd(), 'newfrontend/data/gold-rupee-data.json'),
    path.join(process.cwd(), 'data/gold_rupee_data.json'),
    path.join(process.cwd(), 'backend/data/gold_rupee_data.json')
  ];
  
  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      console.log('Found data file:', filePath);
      return filePath;
    }
  }
  
  return null;
}

// API handler
module.exports = async (req, res) => {
  console.log('API endpoint /api/gold-rupee called at:', new Date().toISOString());
  
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Content-Type', 'application/json');

    const dataFile = findDataFile();
    if (!dataFile) {
      console.error('Data file not found');
      return res.json({ 
        status: 'error',
        message: 'Data file not found',
        metadata: {
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          lastUpdated: new Date().toISOString()
        },
        data: []
      });
    }

    console.log('Using data file:', dataFile);
    const rawData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    
    // Log data boundaries before processing
    if (rawData.data && rawData.data.length > 0) {
      const dates = rawData.data.map(d => new Date(d.date));
      console.log('Raw data date range:', {
        earliest: new Date(Math.min(...dates)).toISOString(),
        latest: new Date(Math.max(...dates)).toISOString(),
        totalPoints: rawData.data.length
      });
    }

    let combinedData = rawData.data || rawData;
    
    // Ensure we have 5 years of data
    const now = new Date();
    const fiveYearsAgo = new Date(now);
    fiveYearsAgo.setFullYear(now.getFullYear() - 5);
    fiveYearsAgo.setHours(0, 0, 0, 0);

    // Generate monthly data points if we're missing any
    const months = 60; // 5 years * 12 months
    const existingDates = new Set(combinedData.map(item => item.date));
    
    for (let i = 0; i < months; i++) {
      const date = new Date(fiveYearsAgo);
      date.setMonth(date.getMonth() + i);
      const dateString = date.toISOString().split('T')[0];
      
      if (!existingDates.has(dateString)) {
        // Interpolate data from nearest points if possible
        const nearestPoint = combinedData
          .sort((a, b) => 
            Math.abs(new Date(a.date) - date) - 
            Math.abs(new Date(b.date) - date)
          )[0];

        combinedData.push({
          date: dateString,
          goldPrice: nearestPoint ? nearestPoint.goldPrice : 0,
          rupeeRate: nearestPoint ? nearestPoint.rupeeRate : 0
        });
      }
    }

    // Filter, clean, and sort the data
    const processedData = combinedData
      .map(item => ({
        date: item.date,
        goldPrice: parseFloat(item.goldPrice || item.gold_price || 0),
        rupeeRate: parseFloat(item.rupeeRate || item.rupee_rate || 0)
      }))
      .filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= fiveYearsAgo && itemDate <= now;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Log processed data before sending
    console.log('Processed data summary:', {
      points: processedData.length,
      dateRange: {
        from: processedData[0]?.date,
        to: processedData[processedData.length - 1]?.date
      },
      latestGoldPrice: processedData[processedData.length - 1]?.goldPrice,
      latestRupeeRate: processedData[processedData.length - 1]?.rupeeRate
    });

    // Return the processed data
    return res.json({
      data: processedData,
      metadata: {
        dataPoints: processedData.length,
        startDate: processedData[0]?.date,
        endDate: processedData[processedData.length - 1]?.date,
        timeRange: '5 years',
        pointsPerYear: Math.round(processedData.length / 5),
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error processing gold-rupee data:', error);
    return res.json({
      status: 'error',
      message: error.message,
      metadata: {
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        lastUpdated: new Date().toISOString()
      },
      data: []
    });
  }
};
