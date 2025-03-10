// Fix for chart rendering issues
(function() {
    console.log("Chart renderer fix loaded");
    
    // Wait for page load
    window.addEventListener('load', function() {
        // Give time for other scripts to run
        setTimeout(fixChartRendering, 1500);
    });
    
    // Function to check and fix chart rendering
    function fixChartRendering() {
        console.log("Running chart rendering fix");
        
        // Check for gold-rupee chart
        const goldRupeeChart = document.getElementById('gold-rupee-chart');
        if (!goldRupeeChart) {
            console.log("Gold-rupee chart container not found");
            return;
        }
        
        // Check if chart has content
        if (goldRupeeChart.innerHTML.trim() === '' || 
            !goldRupeeChart.querySelector('canvas')) {
            
            console.log("Gold-rupee chart appears empty, re-initializing");
            
            // Clear any existing descriptions to prevent duplicates
            const descriptions = document.querySelectorAll('[id$="-description"]');
            descriptions.forEach(desc => desc.remove());
            
            // Reset chart container
            goldRupeeChart.removeAttribute('data-chart-status');
            goldRupeeChart.removeAttribute('data-initialized');
            
            // Re-initialize
            if (typeof window.createStandaloneGoldRupeeChart === 'function') {
                window.createStandaloneGoldRupeeChart('gold-rupee-chart');
            }
        } else {
            console.log("Gold-rupee chart appears to be rendered correctly");
        }
    }
})();
