// Ensures chart is initialized once and only once
(function() {
    console.log("Single chart loader initialized");
    
    let chartInitialized = false;
    
    // Wait for page to fully load
    window.addEventListener('load', function() {
        // Don't interfere with the main script's initialization
        setTimeout(ensureChartLoaded, 2000);
    });
    
    function ensureChartLoaded() {
        if (chartInitialized) return;
        
        const container = document.getElementById('gold-rupee-chart');
        if (!container) {
            console.error("Chart container not found");
            return;
        }
        
        console.log("Initializing chart through single-chart-loader");
        
        // Remove any existing descriptions to prevent duplicates
        document.querySelectorAll('[id$="-description"], [id^="gold-rupee-chart-description"]').forEach(el => el.remove());
        
        if (typeof window.createStandaloneGoldRupeeChart === 'function') {
            window.createStandaloneGoldRupeeChart('gold-rupee-chart');
            chartInitialized = true;
        } else {
            console.error("Chart function not available");
        }
    }
})();
