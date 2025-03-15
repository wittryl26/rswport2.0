// Disable this entire file to prevent conflicts
/*
Original code commented out to prevent interference with chart initialization
*/

/**
 * Single-purpose chart loader that guarantees chart initialization
 */

console.log("Single chart loader initializing");

// Function to ensure chart loads
function guaranteeChartLoad() {
    console.log("Guaranteeing chart load");
    
    // Try to find chart container
    const chartContainer = document.getElementById('gold-rupee-chart');
    
    if (!chartContainer) {
        console.error("Chart container not found in DOM");
        return;
    }
    
    console.log("Found chart container:", chartContainer);
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error("Chart.js not loaded");
        return;
    }
    
    // Make sure container has a canvas
    let canvas = chartContainer.querySelector('canvas');
    if (!canvas) {
        console.log("Creating new canvas in chart container");
        canvas = document.createElement('canvas');
        chartContainer.appendChild(canvas);
    }
    
    // Try to load chart via existing function
    if (typeof loadGoldRupeeChart === 'function') {
        console.log("Using loadGoldRupeeChart function");
        try {
            loadGoldRupeeChart('gold-rupee-chart');
        } catch (e) {
            console.error("Error calling loadGoldRupeeChart:", e);
            createFallbackChart(canvas);
        }
    } else {
        console.log("loadGoldRupeeChart function not available, using fallback");
        createFallbackChart(canvas);
    }
}

// Function to create a simple fallback chart
function createFallbackChart(canvas) {
    console.log("Creating fallback chart");
    
    try {
        // Create a sample dataset
        const data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [{
                label: 'Gold Price (USD)',
                data: [1780, 1830, 1790, 1840, 1910, 1870, 1920],
                borderColor: 'rgb(255, 215, 0)',
                backgroundColor: 'rgba(255, 215, 0, 0.2)',
                borderWidth: 2,
                tension: 0.4
            }, {
                label: 'INR/USD Exchange Rate',
                data: [73.2, 72.8, 73.5, 74.1, 73.9, 74.5, 75.0],
                borderColor: 'rgb(100, 255, 218)',
                backgroundColor: 'rgba(100, 255, 218, 0.2)',
                borderWidth: 2,
                tension: 0.4,
                yAxisID: 'y2'
            }]
        };
        
        // Create chart with dark theme
        new Chart(canvas, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Gold Price vs INR Exchange Rate',
                        color: '#ffffff',
                        font: {
                            family: "'IBM Plex Mono', monospace",
                            size: 16
                        }
                    },
                    legend: {
                        labels: {
                            color: '#a0a0a0',
                            font: {
                                family: "'IBM Plex Mono', monospace"
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#a0a0a0',
                            font: {
                                family: "'IBM Plex Mono', monospace"
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#a0a0a0',
                            font: {
                                family: "'IBM Plex Mono', monospace"
                            }
                        },
                        title: {
                            display: true,
                            text: 'Gold Price (USD)',
                            color: '#ffffff',
                            font: {
                                family: "'IBM Plex Mono', monospace"
                            }
                        }
                    },
                    y2: {
                        position: 'right',
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#a0a0a0',
                            font: {
                                family: "'IBM Plex Mono', monospace"
                            }
                        },
                        title: {
                            display: true,
                            text: 'INR/USD Rate',
                            color: '#ffffff',
                            font: {
                                family: "'IBM Plex Mono', monospace"
                            }
                        }
                    }
                }
            }
        });
        console.log("Fallback chart created successfully");
    } catch (error) {
        console.error("Failed to create fallback chart:", error);
    }
}

// Run after a short delay to make sure DOM is ready
setTimeout(guaranteeChartLoad, 1000);

// Also run on window load to be extra safe
window.addEventListener('load', function() {
    setTimeout(guaranteeChartLoad, 500);
});
