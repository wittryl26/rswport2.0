// API Service with fallback initialization
class ApiService {
    constructor() {
        console.log('API Service initialized with baseUrl:', this.baseUrl);
    }

    async initialize() {
        try {
            // Use config if available, otherwise use defaults
            if (typeof window.initializeApiConfig === 'function') {
                this.config = await window.initializeApiConfig();
            } else {
                this.config = {
                    baseUrl: window.location.hostname.includes('localhost') 
                        ? 'http://localhost:3001'
                        : 'https://rylandw.vercel.app',
                    endpoints: {
                        goldRupee: '/api/gold-rupee',
                        economicData: '/api/economic-data'
                    }
                };
            }
            return this.config;
        } catch (error) {
            console.error('API initialization error:', error);
            return null;
        }
    }

    async get(endpoint) {
        try {
            console.log('API GET request to', endpoint);
            const url = `${this.config.baseUrl}${endpoint}`;
            console.log('Fetching from URL:', url);
            
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.status === 'error') {
                throw new Error(data.message);
            }
            
            return data;
        } catch (error) {
            console.error(`API GET error for ${endpoint}:`, error);
            throw error;
        }
    }
    
    async getEconomicData() {
        return this.get(this.config.endpoints.economicData);
    }
    
    async getFinancialData() {
        return this.get('/api/financial');
    }
    
    async getGoldRupeeData() {
        const data = await this.get(this.config.endpoints.goldRupee);
        console.log('Gold-rupee data fetched from API:', data);
        return data;
    }
}

// Make service available globally
window.apiService = new ApiService();
window.initializeApiService = async function() {
    return window.apiService.initialize();
};

console.log('API Service module loaded');
