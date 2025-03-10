// Fallback data for when API is unavailable

(function() {
    console.log('Fallback data module loaded');
    
    window.fallbackData = {
        goldRupee: {
            title: "Gold Price vs USD/INR Exchange Rate (Fallback)",
            data: [
                { date: '2024-04-01', goldPrice: 2291.4, rupeeRate: 83.45 },
                { date: '2024-05-01', goldPrice: 2322.9, rupeeRate: 83.32 },
                { date: '2024-06-01', goldPrice: 2327.7, rupeeRate: 83.45 },
                { date: '2024-07-01', goldPrice: 2426.5, rupeeRate: 83.74 },
                { date: '2024-08-01', goldPrice: 2493.8, rupeeRate: 83.9 },
                { date: '2024-09-01', goldPrice: 2568.2, rupeeRate: 83.82 },
                { date: '2024-10-01', goldPrice: 2738.3, rupeeRate: 83.72 },
                { date: '2024-11-01', goldPrice: 2657, rupeeRate: 84.09 },
                { date: '2024-12-01', goldPrice: 2636.5, rupeeRate: 84.56 },
                { date: '2025-01-01', goldPrice: 2812.5, rupeeRate: 85.79 },
                { date: '2025-02-01', goldPrice: 2836.8, rupeeRate: 86.65 },
                { date: '2025-03-01', goldPrice: 2917.7, rupeeRate: 87.33 }
            ],
            lastUpdated: new Date().toISOString()
        }
    };
})();
