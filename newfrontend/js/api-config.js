// Simple API configuration
const API_CONFIG = {
    baseUrl: 'https://rylandw.vercel.app',  // Point directly to Vercel deployment
    endpoints: {
        goldRupee: '/api/gold-rupee',
        economicData: '/econ-data'
    }
};

// Make config available globally
window.API_CONFIG = API_CONFIG;

// Don't edit below this line
if (typeof module !== 'undefined') {
  module.exports = API_CONFIG;
}
