/**
 * Fix for chart loading issues and API connection problems
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Chart loading fix script initialized');
    
    // Track if we've already applied fallbacks
    let fallbackApplied = false;
    
    // Function to check if Chart.js is properly loaded
    function verifyChartLibrary() {
        if (typeof Chart === 'undefined') {
            console.error('Chart.js not available - trying to reload');
            loadChartLibrary();
            return false;
        }
        return true;
    }
    
    // Function to load Chart.js dynamically if needed
    function loadChartLibrary() {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
        script.onload = function() {
            console.log('Chart.js loaded dynamically');
            initializeCharts();
        };
        script.onerror = function() {
            console.error('Failed to load Chart.js dynamically');
            activateFallbackData();
        };
        document.head.appendChild(script);
    }
    
    // Function to initialize charts
    function initializeCharts() {
        console.log('Initializing charts...');
        
        // Get all chart containers
        const chartContainers = document.querySelectorAll('.chart-container');
        console.log(`Found ${chartContainers.length} chart containers`);
        
        // Check if we need to load charts
        if (chartContainers.length === 0) {
            console.log('No chart containers found on this page');
            return;
        }
        
        // Verify Chart.js is available
        if (!verifyChartLibrary()) return;
        
        // Try to load charts
        try {
            // Check if chart loading function exists
            if (typeof loadAllCharts === 'function') {
                console.log('Calling loadAllCharts function');
                loadAllCharts();
            } else if (typeof loadGoldRupeeChart === 'function') {
                console.log('Calling loadGoldRupeeChart function');
                chartContainers.forEach((container, index) => {
                    loadGoldRupeeChart(container.id || `chart-${index}`);
                });
            } else {
                console.error('Chart loading functions not found');
                activateFallbackData();
            }
        } catch (error) {
            console.error('Error initializing charts:', error);
            activateFallbackData();
        }
    }
    
    // Function to activate fallback data
    function activateFallbackData() {
        if (fallbackApplied) return;
        
        console.log('Activating fallback data for charts');
        fallbackApplied = true;
        
        // Check if fallback function exists
        if (typeof useSampleData === 'function') {
            console.log('Using sample data function');
            useSampleData();
        } else if (typeof window.sampleChartData !== 'undefined') {
            // Use sample data directly
            console.log('Sample chart data found - applying directly');
            loadChartsWithSampleData();
        } else {
            console.error('No fallback data available');
        }
    }
    
    // Function to load charts with sample data
    function loadChartsWithSampleData() {
        if (!verifyChartLibrary()) return;
        
        // Get chart containers
        const chartContainers = document.querySelectorAll('.chart-container');
        
        // Create basic charts with sample data
        chartContainers.forEach((container, index) => {
            const canvas = container.querySelector('canvas') || document.createElement('canvas');
            if (!container.contains(canvas)) {
                container.appendChild(canvas);
            }
            
            try {
                new Chart(canvas, {
                    type: 'line',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [{
                            label: 'Sample Data',
                            data: [12, 19, 3, 5, 2, 3],
                            borderColor: 'rgb(100, 255, 218)',
                            backgroundColor: 'rgba(100, 255, 218, 0.2)',
                            tension: 0.3
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });
                console.log(`Created fallback chart for ${container.id || `chart-${index}`}`);
            } catch (error) {
                console.error(`Failed to create fallback chart:`, error);
            }
        });
    }
    
    // Check API status and initialize charts
    function checkApiAndInitialize() {
        const apiStatus = document.getElementById('api-status');
        
        if (apiStatus) {
            apiStatus.setAttribute('title', 'Checking API connection...');
        }
        
        // Try to initialize charts after a short delay
        setTimeout(function() {
            initializeCharts();
            
            // Check if we need fallback after a timeout
            setTimeout(function() {
                const chartCanvases = document.querySelectorAll('.chart-container canvas');
                if (chartCanvases.length === 0) {
                    console.warn('No chart canvases found after initialization, activating fallback');
                    activateFallbackData();
                }
            }, 2000);
        }, 500);
    }
    
    // Start the initialization process
    checkApiAndInitialize();
});
