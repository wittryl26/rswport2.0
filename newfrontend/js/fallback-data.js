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

    window.goldRupeeFallbackData = {
        metadata: {
            startDate: '2023-01-01',
            endDate: '2023-12-31',
            dataPoints: 12,
            lastUpdated: new Date().toISOString()
        },
        data: [
            { date: '2023-01-01', goldPrice: 1830.25, rupeeRate: 82.74 },
            { date: '2023-02-01', goldPrice: 1859.75, rupeeRate: 82.95 },
            { date: '2023-03-01', goldPrice: 1845.30, rupeeRate: 83.12 },
            { date: '2023-04-01', goldPrice: 1982.10, rupeeRate: 82.53 },
            { date: '2023-05-01', goldPrice: 2035.45, rupeeRate: 82.67 },
            { date: '2023-06-01', goldPrice: 1976.40, rupeeRate: 83.30 },
            { date: '2023-07-01', goldPrice: 1942.15, rupeeRate: 83.14 },
            { date: '2023-08-01', goldPrice: 1994.80, rupeeRate: 83.23 },
            { date: '2023-09-01', goldPrice: 1866.30, rupeeRate: 83.42 },
            { date: '2023-10-01', goldPrice: 1985.60, rupeeRate: 83.36 },
            { date: '2023-11-01', goldPrice: 2043.20, rupeeRate: 83.11 },
            { date: '2023-12-01', goldPrice: 2078.40, rupeeRate: 83.18 }
        ]
    };
})();
