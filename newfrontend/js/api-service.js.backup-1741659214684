// API Service
(function() {
    // API Service class
    class ApiService {
        constructor(config) {
            this.baseUrl = config.baseUrl;
            this.timeout = config.timeout || 10000;
            this.retries = config.retryCount || 3;
            this.initialized = true;
            console.log(`API Service initialized with baseUrl: ${this.baseUrl}`);
        }
        
        async get(endpoint) {
            console.log(`API GET request to ${endpoint}`);
            try {
                const url = `${this.baseUrl}/${endpoint}`;
                console.log(`Fetching from URL: ${url}`);
                
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log(`API data received for ${endpoint}:`, data);
                return data;
            } catch (error) {
                console.error(`API GET error for ${endpoint}:`, error);
                throw error;
            }
        }
        
        async getEconomicData() {
            return this.get('econ-data');
        }
        
        async getFinancialData() {
            return this.get('financial');
        }
        
        async getGoldRupeeData() {
            const data = await this.get('gold-rupee');
            console.log('Gold-rupee data fetched from API:', data);
            return data;
        }
    }
    
    // Initialize API service
    window.initializeApiService = async function() {
        // Make sure we have a config first
        const config = window.apiConfig || await window.initializeApiConfig();
        
        // Create and store the service
        window.apiService = new ApiService(config);
        return window.apiService;
    };
    
    console.log('API Service module loaded');
})();
