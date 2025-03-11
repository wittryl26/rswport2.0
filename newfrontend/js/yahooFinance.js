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
        const endDate = new Date();
        /* Using 5-year data from API */;
        startDate.setFullYear(endDate.getFullYear() - 1);

        try {
            const [goldData, inrData] = await Promise.all([
                this.fetchData('GC=F', startDate, endDate),  // Gold futures
                this.fetchData('INR=X', startDate, endDate)  // INR/USD exchange rate
            ]);

            return {
                title: "Gold Price vs USD/INR Exchange Rate",
                data: goldData.map((gold, index) => ({
                    date: gold.date,
                    goldPrice: parseFloat(gold.close?.toFixed(2) || 0),
                    rupeeRate: parseFloat(inrData[index]?.close?.toFixed(2) || 0)
                })).filter(item => item.goldPrice && item.rupeeRate),
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error fetching Yahoo Finance data:', error);
            throw error;
        }
    }
}

module.exports = new YahooFinanceService();
