/**
 * Bottleneck Data Service - Stub Version
 * Provides a minimal implementation that won't cause errors
 */

class BottleneckDataService {
  constructor(options = {}) {
    console.log('Bottleneck Data Service initialized as stub');
    this.onDataUpdate = options.onDataUpdate || (() => {});
    this.onConnectionStatusChange = options.onConnectionStatusChange || (() => {});
  }

  // Simple stub methods that won't make real API calls
  async connect() {
    console.log('Using stub implementation - no API calls will be made');
    this.onConnectionStatusChange({ 
      status: 'connected', 
      message: 'Using local data (no API connection)' 
    });
    
    // Use local sample data
    const sampleData = this.getSampleData();
    this.onDataUpdate(sampleData);
    
    return true;
  }

  disconnect() {
    console.log('Disconnected stub service');
  }

  getSampleData() {
    return {
      projects: [
        {
          name: "Cloud Migration",
          phases: [
            {name: "Planning", risk: 0.2, resources: 3, duration: 14, bottleneckRisk: "Low"},
            {name: "Development", risk: 0.7, resources: 5, duration: 45, bottleneckRisk: "High"}
          ]
        }
      ],
      meta: {
        lastUpdated: new Date().toISOString(),
        source: "Local Sample Data"
      }
    };
  }
}

// Export the service as a global variable for easier access
window.BottleneckDataService = BottleneckDataService;
