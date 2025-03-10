// Fix for chart display issues
(function() {
    console.log("Chart fixer loaded");
    
    // Function to force refresh a specific chart
    window.forceRefreshChart = function(containerId) {
        console.log(`Force refreshing chart: ${containerId}`);
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container not found: ${containerId}`);
            return;
        }
        
        // Remove any existing chart
        container.innerHTML = '';
        container.removeAttribute('data-chart-status');
        container.removeAttribute('data-initialized');
        
        // For gold-rupee chart
        if (containerId === 'gold-rupee-chart') {
            if (typeof window.createStandaloneGoldRupeeChart === 'function') {
                window.createStandaloneGoldRupeeChart(containerId);
                console.log("Gold-Rupee chart forcefully refreshed");
            }
        }
    };
    
    // Initialize charts on DOMContentLoaded
    window.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            console.log("Running chart fixer");
            // Check for gold-rupee chart
            const goldRupeeChart = document.getElementById('gold-rupee-chart');
            if (goldRupeeChart) {
                window.forceRefreshChart('gold-rupee-chart');
            }
        }, 1500); // Wait for other scripts
    });
})();
