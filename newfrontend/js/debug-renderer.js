// Debug helper to visualize container dimensions - DISABLED FOR PRODUCTION
(function() {
    console.log('Debug renderer disabled for production');
    
    // Disabled debug visualization for production
    window.DEBUG_ENABLED = false;
    
    window.addEventListener('DOMContentLoaded', function() {
        // Only run if explicitly enabled
        if (window.DEBUG_ENABLED === true) {
            setTimeout(function() {
                console.log('Running debug renderer');
                
                // Add debug outlines to chart containers
                const charts = document.querySelectorAll('.chart-container');
                charts.forEach((chart, i) => {
                    console.log(`Chart ${i} dimensions:`, {
                        width: chart.offsetWidth,
                        height: chart.offsetHeight,
                        visible: isVisible(chart)
                    });
                    
                    // Add debug overlay - DISABLED
                    // const debugOverlay = document.createElement('div');
                    // debugOverlay.textContent = `Chart: ${chart.id} (${chart.offsetWidth}x${chart.offsetHeight})`;
                    // chart.appendChild(debugOverlay);
                });
            }, 1000);
        }
    });
    
    // Helper function to check if element is visible
    function isVisible(el) {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               el.offsetWidth > 0 && 
               el.offsetHeight > 0;
    }
})();
