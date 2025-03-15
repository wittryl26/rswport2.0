const axios = require('axios');
const yahooFinanceUrl = 'https://query1.finance.yahoo.com/v8/finance/chart';

class YahooFinanceService {
    async fetchData(symbol, startDate, endDate) {
        try {
            const period1 = Math.floor(new Date(startDate).getTime() / 1000);
            const period2 = Math.floor(new Date(endDate).getTime() / 1000);
            // Changed interval to monthly
            const url = `${yahooFinanceUrl}/${symbol}?period1=${period1}&period2=${period2}&interval=1mo`;
            
            const response = await axios.get(url);
            return this.processYahooResponse(response.data);
        } catch (error) {
            console.error(`Error fetching data for ${symbol}:`, error.message);
            throw error;
        }
    }

    processYahooResponse(data) {
        if (!data.chart || !data.chart.result || !data.chart.result[0]) {
            throw new Error('Invalid Yahoo Finance response format');
        }

        const result = data.chart.result[0];
        const timestamps = result.timestamp;
        const quotes = result.indicators.quote[0];
        
        return timestamps.map((time, index) => ({
            date: new Date(time * 1000).toISOString().split('T')[0],
            close: quotes.close[index],
            open: quotes.open[index],
            high: quotes.high[index],
            low: quotes.low[index],
            volume: quotes.volume[index]
        }));
    }

    async getGoldAndRupeeData() {
        // Use a 5-year range instead of 1 year
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - 5); // Change to 5 years

        try {
            // Format dates correctly for Yahoo Finance API
            const period1 = Math.floor(startDate.getTime() / 1000);
            const period2 = Math.floor(endDate.getTime() / 1000);

            const [goldData, inrData] = await Promise.all([
                this.fetchData('GC=F', startDate, endDate),  // Gold futures
                this.fetchData('INR=X', startDate, endDate)  // INR/USD exchange rate
            ]);

            // Process and validate the data
            const processedData = {
                title: "Gold Price vs USD/INR Exchange Rate (5 Year Trend)",
                data: goldData
                    .filter((gold, index) => gold.close && inrData[index]?.close) // Remove null values
                    .map((gold, index) => ({
                        date: gold.date,
                        goldPrice: parseFloat(gold.close.toFixed(2)),
                        rupeeRate: parseFloat(inrData[index].close.toFixed(2))
                    })),
                metadata: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    lastUpdated: new Date().toISOString()
                }
            };

            // Verify we have data
            if (!processedData.data.length) {
                throw new Error('No valid data points returned from Yahoo Finance');
            }

            console.log(`Retrieved ${processedData.data.length} data points from Yahoo Finance`);
            return processedData;
        } catch (error) {
            console.error('Error fetching Yahoo Finance data:', error);
            throw error;
        }
    }
}

module.exports = new YahooFinanceService();
