// Sample Data Provider
(function() {
    // Sample data provider class
    class SampleDataProvider {
        constructor() {
            console.log('Enhanced sample data provider initialized');
        }
        
        async getEconomicData() {
            return [
                { date: '2023-01-01', indicator: 'GDP Growth', value: 3.2 },
                { date: '2023-02-01', indicator: 'GDP Growth', value: 3.3 },
                { date: '2023-03-01', indicator: 'GDP Growth', value: 3.5 },
                { date: '2023-04-01', indicator: 'GDP Growth', value: 3.4 },
                { date: '2023-05-01', indicator: 'GDP Growth', value: 3.6 },
                { date: '2023-06-01', indicator: 'GDP Growth', value: 3.5 },
                { date: '2023-07-01', indicator: 'GDP Growth', value: 3.7 },
                { date: '2023-08-01', indicator: 'GDP Growth', value: 3.8 },
                { date: '2023-09-01', indicator: 'GDP Growth', value: 3.6 },
                { date: '2023-10-01', indicator: 'GDP Growth', value: 3.5 },
                { date: '2023-11-01', indicator: 'GDP Growth', value: 3.4 },
                { date: '2023-12-01', indicator: 'GDP Growth', value: 3.2 }
            ];
        }
        
        async getFinancialData() {
            return [
                { date: '2023-01-01', actual: 100.0, predicted: 98.5, indicator: 'Market Index' },
                { date: '2023-02-01', actual: 102.3, predicted: 101.0, indicator: 'Market Index' },
                { date: '2023-03-01', actual: 105.7, predicted: 104.2, indicator: 'Market Index' },
                { date: '2023-04-01', actual: 103.2, predicted: 106.0, indicator: 'Market Index' },
                { date: '2023-05-01', actual: 107.9, predicted: 105.5, indicator: 'Market Index' },
                { date: '2023-06-01', actual: 110.3, predicted: 109.0, indicator: 'Market Index' },
                { date: '2023-07-01', actual: 108.1, predicted: 111.5, indicator: 'Market Index' },
                { date: '2023-08-01', actual: 112.7, predicted: 110.0, indicator: 'Market Index' },
                { date: '2023-09-01', actual: 115.9, predicted: 114.0, indicator: 'Market Index' },
                { date: '2023-10-01', actual: 118.3, predicted: 117.5, indicator: 'Market Index' },
                { date: '2023-11-01', actual: 116.5, predicted: 119.0, indicator: 'Market Index' },
                { date: '2023-12-01', actual: 120.8, predicted: 118.0, indicator: 'Market Index' }
            ];
        }
        
        async getGoldRupeeData() {
            // Generate 5 years of monthly data for Gold and Rupee
            return {
                title: "Gold Price vs USD/INR Exchange Rate (5 Years)",
                data: this.generateFiveYearsData(),
                lastUpdated: new Date().toISOString()
            };
        }
        
        // Helper method to generate realistic 5-year data
        generateFiveYearsData() {
            const data = [];
            /* Using 5-year data from API */;
            
            // Gold price starting around $1,500
            let goldPrice = 1500;
            // Rupee rate starting around 71
            let rupeeRate = 71;
            
            // Generate monthly data points for 5 years (60 months)
            for (let i = 0; i < 60; i++) {
                const currentDate = new Date(startDate);
                currentDate.setMonth(startDate.getMonth() + i);
                
                // Add some realistic variation to the data
                // Gold has generally trended upward over time
                goldPrice += (Math.random() * 50) - 15;  // Trending upward
                if (i > 24) goldPrice += (Math.random() * 15); // Stronger trend in later years
                
                // Rupee generally weakened against USD over time
                rupeeRate += (Math.random() * 0.5) - 0.2; // Slight weakening trend
                
                // Add some correlation between gold price and rupee rate
                if (goldPrice > 2500) rupeeRate += (Math.random() * 0.2); // Higher gold can correlate with weaker rupee
                
                // Keep values in realistic ranges
                goldPrice = Math.max(1400, Math.min(3000, goldPrice));
                rupeeRate = Math.max(70, Math.min(90, rupeeRate));
                
                data.push({
                    date: currentDate.toISOString().split('T')[0],
                    goldPrice: parseFloat(goldPrice.toFixed(2)),
                    rupeeRate: parseFloat(rupeeRate.toFixed(2))
                });
            }
            
            return data;
        }
    }
    
    // Create and expose the provider
    window.sampleDataProvider = new SampleDataProvider();
    
    console.log('Enhanced sample data loader initialized');
})();
