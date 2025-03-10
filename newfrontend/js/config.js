/**
 * Application configuration
 */
const config = {
  // API base URL - detects if we're in production (on Vercel)
  apiBaseUrl: window.location.hostname === 'localhost' 
    ? 'http://localhost:3001'
    : '', // On Vercel, API and frontend are on same domain, so empty string works
  
  // Default API endpoints
  endpoints: {
    health: '/api/health',
    goldInrData: '/api/gold-inr-data',
    financialData: '/api/financial-data'
  },
  
  // Chart configuration
  chart: {
    defaultPeriod: '5y',
    availablePeriods: ['1y', '3y', '5y', 'all']
  }
};

export default config;
