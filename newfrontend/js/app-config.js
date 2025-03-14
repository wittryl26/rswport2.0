/**
 * Configuration
 * Generated merge
 * Merged on: 2025-03-11T00:02:03.117Z
 */


// ===============================================
// Source: api-config.js
// ===============================================

// API Configuration
(function() {
    // Default configuration
    const defaultConfig = {
        baseUrl: 'http://localhost:3000', // Default API base URL
        apiVersion: 'v1',
        timeout: 10000,
        retryCount: 3
    };
    
    // Auto-detect API URL from the current page
    function detectApiUrl() {
        const host = window.location.hostname;
        // If we're serving from a local server like Live Server, 
        // we need to get the backend URL from the current page
        if (window.location.port && window.location.port !== '3000') {
            return `http://${host}:3000`;
        }
        return defaultConfig.baseUrl;
    }
    
    // Initialize API configuration with auto-detection
    window.apiConfig = {
        ...defaultConfig,
        baseUrl: detectApiUrl()
    };
    
    // Helper to initialize the API configuration
    window.initializeApiConfig = async function() {
        try {
            console.log('Initializing API configuration...');
            console.log(`Using API URL: ${window.apiConfig.baseUrl}`);
            
            // Try to get health status
            const healthCheckUrl = `${window.apiConfig.baseUrl}/health`;
            const response = await fetch(healthCheckUrl, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            
            if (!response.ok) {
                throw new Error(`API health check failed: ${response.status}`);
            }
            
            // Update status indicator if it exists
            const statusEl = document.getElementById('api-status');
            if (statusEl) {
                statusEl.className = 'api-status connected';
                statusEl.title = 'API connected and healthy';
            }
            
            console.log('API configuration initialized');
            return window.apiConfig;
        } catch (error) {
            console.error('API configuration error:', error.message);
            
            // Update status indicator
            const statusEl = document.getElementById('api-status');
            if (statusEl) {
                statusEl.className = 'api-status error';
                statusEl.title = `API connection error: ${error.message}`;
            }
            
            // Return config anyway
            return window.apiConfig;
        }
    };
    
    console.log('API config module loaded');
})();

/**
 * API Configuration
 */

const API_CONFIG = {
  // Change this to your deployed API URL
  baseUrl: 'https://your-api-url.onrender.com',
  
  // Fallback to localhost for development
  localUrl: 'http://localhost:3000',
  
  // Endpoints
  endpoints: {
    goldRupee: '/gold-rupee',
    economicData: '/econ-data',
    financialData: '/financial',
    bottleneckData: '/api/bottleneck-data'
  },
  
  // Request timeout in milliseconds
  timeout: 8000
};

// Don't edit below this line
if (typeof module !== 'undefined') {
  module.exports = API_CONFIG;
}



// ===============================================
// Source: config.js
// ===============================================

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


