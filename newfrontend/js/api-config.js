// Simple API configuration
const API_CONFIG = {
    baseUrl: window.location.hostname.includes('localhost') 
        ? 'http://localhost:3001'
        : 'https://rylandw.vercel.app',
    endpoints: {
        goldRupee: '/api/gold-rupee',
        economicData: '/api/economic-data'
    }
};

// Make config available globally
window.API_CONFIG = API_CONFIG;

// Don't edit below this line
if (typeof module !== 'undefined') {
  module.exports = API_CONFIG;
}
