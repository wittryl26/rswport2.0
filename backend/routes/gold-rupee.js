const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

// GET /gold-rupee - Return gold and rupee exchange rate data
router.get('/', async (req, res) => {
    try {
        // Read the data file directly for simplicity
        const dataPath = path.join(__dirname, '../data/gold_rupee_data.json');
        const fileData = await fs.readFile(dataPath, 'utf8');
        const data = JSON.parse(fileData);
        
        console.log('Serving gold-rupee data with', data.data.length, 'data points');
        
        res.json(data);
    } catch (error) {
        console.error('Error serving gold-rupee data:', error);
        
        // Provide fallback data
        const fallbackData = {
            title: "Gold Price vs USD/INR Exchange Rate",
            data: [
                { date: '2024-04-01', goldPrice: 2291.4, rupeeRate: 83.45 },
                { date: '2024-05-01', goldPrice: 2322.9, rupeeRate: 83.32 },
                { date: '2024-06-01', goldPrice: 2327.7, rupeeRate: 83.45 },
                { date: '2024-07-01', goldPrice: 2426.5, rupeeRate: 83.74 },
                { date: '2024-08-01', goldPrice: 2493.8, rupeeRate: 83.90 },
                { date: '2024-09-01', goldPrice: 2568.2, rupeeRate: 83.82 },
                { date: '2024-10-01', goldPrice: 2738.3, rupeeRate: 83.72 },
                { date: '2024-11-01', goldPrice: 2657.0, rupeeRate: 84.09 },
                { date: '2024-12-01', goldPrice: 2636.5, rupeeRate: 84.56 },
                { date: '2025-01-01', goldPrice: 2812.5, rupeeRate: 85.79 },
                { date: '2025-02-01', goldPrice: 2836.8, rupeeRate: 86.65 },
                { date: '2025-03-01', goldPrice: 2917.7, rupeeRate: 87.33 }
            ],
            lastUpdated: new Date().toISOString()
        };
        
        res.json(fallbackData);
    }
});

module.exports = router;
