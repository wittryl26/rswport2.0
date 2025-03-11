// Ensures chart is initialized once and only once
(function() {
    console.log("Single chart loader initialized");

    function initializeChart(container) {
        // Check if chart is already initialized
        if (container.hasAttribute('data-chart-loaded')) {
            console.log('Chart already loaded, skipping initialization');
            return;
        }

        // Check if container has valid data
        const chartType = container.getAttribute('data-chart-type');
        if (!chartType) {
            console.log('No chart type specified, skipping');
            return;
        }

        console.log(`Initializing chart through single-chart-loader for type: ${chartType}`);
        
        // Only initialize if it's not a gold-rupee chart (those are handled elsewhere)
        if (chartType !== 'gold-rupee') {
            window.customChartLoader?.initializeChart(container);
        } else {
            console.log('Skipping gold-rupee chart as it is handled by main loader');
        }
    }

    // Initialize any charts on the page
    document.addEventListener('DOMContentLoaded', () => {
        const chartContainers = document.querySelectorAll('.chart-container');
        chartContainers.forEach(container => {
            if (!container.hasAttribute('data-initialized')) {
                initializeChart(container);
            }
        });
    });
})();
