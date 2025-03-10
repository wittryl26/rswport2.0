// Simple script to load charts when the page loads
(function() {
    console.log("API chart loader initialized");
    
    // Function to load the chart
    function loadApiChart() {
        console.log("Loading API chart");
        
        const container = document.getElementById('gold-rupee-chart');
        if (!container) {
            console.error("Gold-rupee chart container not found");
            return;
        }
        
        // Use direct fetch with the API endpoint
        if (window.createStandaloneGoldRupeeChart) {
            window.createStandaloneGoldRupeeChart('gold-rupee-chart');
        }
    }
    
    // Event listener to load chart when page is loaded
    window.addEventListener('load', function() {
        // Wait a bit to ensure other scripts are loaded
        setTimeout(loadApiChart, 500);
    });
})();
