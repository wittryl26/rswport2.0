/**
 * Direct chart implementation that bypasses all existing code
 */

// Execute when page is fully loaded to ensure all resources are available
window.addEventListener('load', function() {
    console.log("Direct chart script running on window load");
    setTimeout(createDirectChart, 500);
});

// Execute on DOMContentLoaded as well for redundancy
document.addEventListener('DOMContentLoaded', function() {
    console.log("Direct chart script running on DOMContentLoaded");
    setTimeout(createDirectChart, 500);
});

function createDirectChart() {
    console.log("Creating direct chart...");
    
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.error("Chart.js not available, attempting to load it");
        loadChartJsLibrary();
        return;
    }
    
    // Find or create container
    let chartContainer = document.getElementById('direct-chart-container');
    if (!chartContainer) {
        console.log("Creating new chart container");
        chartContainer = document.createElement('div');
        chartContainer.id = 'direct-chart-container';
        chartContainer.className = 'chart-container';
        chartContainer.style.height = '400px';
        chartContainer.style.marginTop = '30px';
        chartContainer.style.marginBottom = '30px';
        
        // Insert container at top of main content for visibility
        const main = document.querySelector('main');
        if (main && main.firstChild) {
            main.insertBefore(chartContainer, main.firstChild);
        } else {
            // Fallback to appending to body
            document.body.appendChild(chartContainer);
        }
    }
    
    // Create canvas element
    let canvas = chartContainer.querySelector('canvas');
    if (!canvas) {
        console.log("Creating new canvas in container");
        canvas = document.createElement('canvas');
        chartContainer.appendChild(canvas);
    }
    
    // Create the chart using inline data
    try {
        console.log("Attempting to create chart");
        
        const ctx = canvas.getContext('2d');
        
        // Sample data
        const chartData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [{
                label: 'Gold Price (USD)',
                data: [1780, 1830, 1790, 1840, 1910, 1870, 1920],
                borderColor: '#FFDF00',
                backgroundColor: 'rgba(255, 223, 0, 0.2)',
                borderWidth: 2,
                tension: 0.4
            }, {
                label: 'INR/USD Exchange Rate',
                data: [73.2, 72.8, 73.5, 74.1, 73.9, 74.5, 75.0],
                borderColor: '#64ffda',
                backgroundColor: 'rgba(100, 255, 218, 0.2)',
                borderWidth: 2,
                tension: 0.4,
                yAxisID: 'y2'
            }]
        };
        
        // Chart configuration
        new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Gold Price vs INR Exchange Rate',
                        color: '#ffffff',
                        font: {
                            family: "'IBM Plex Mono', monospace",
                            size: 16
                        },
                        padding: {
                            top: 10,
                            bottom: 20
                        }
                    },
                    legend: {
                        labels: {
                            color: '#a0a0a0',
                            font: {
                                family: "'IBM Plex Mono', monospace"
                            },
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 15, 15, 0.85)',
                        titleFont: {
                            family: "'IBM Plex Mono', monospace"
                        },
                        bodyFont: {
                            family: "'IBM Plex Mono', monospace"
                        },
                        borderColor: '#64ffda',
                        borderWidth: 1
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
        
        console.log("Chart created successfully!");
    } catch (error) {
        console.error("Error creating chart:", error);
    }
}

// Function to dynamically load Chart.js if needed
function loadChartJsLibrary() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
    script.onload = function() {
        console.log("Chart.js loaded dynamically");
        setTimeout(createDirectChart, 100);
    };
    document.head.appendChild(script);
}
