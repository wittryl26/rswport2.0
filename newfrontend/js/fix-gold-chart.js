/**
 * Direct fix for gold-rupee chart - matches original implementation
 */

// Only run once
let chartFixed = false;

// Wait for page to be fully loaded
window.addEventListener('load', function() {
    if (!chartFixed) {
        fixGoldRupeeChart();
    }
});

function fixGoldRupeeChart() {
    // Avoid running more than once
    if (chartFixed) return;
    
    console.log("Fixing Gold Rupee Chart");
    
    // Make sure Chart.js is available
    if (typeof Chart === 'undefined') {
        console.error("Chart.js not available");
        return;
    }
    
    // Add the chart container to the page - EXACT LOCATION from the original working version
    const projectsSection = document.getElementById('projects');
    if (!projectsSection) return;
    
    // Create and add chart container in ORIGINAL POSITION (after projects heading, before cards)
    const chartContainer = document.createElement('div');
    chartContainer.id = 'gold-rupee-chart';
    chartContainer.className = 'chart-container';
    chartContainer.style.margin = '2rem 0';
    chartContainer.style.height = '400px';
    
    // Insert at exact position (after projects heading, before card grid)
    const cardGrid = document.getElementById('card-container');
    if (cardGrid) {
        projectsSection.insertBefore(chartContainer, cardGrid);
    } else {
        projectsSection.appendChild(chartContainer);
    }
    
    // Create canvas for the chart
    const canvas = document.createElement('canvas');
    chartContainer.appendChild(canvas);
    
    // Create the chart with ORIGINAL DATA & CONFIG
    try {
        new Chart(canvas, {
            type: 'line',
            data: {
                labels: ['2016', '2017', '2018', '2019', '2020', '2021', '2022'],
                datasets: [{
                    label: 'Gold Price (USD)',
                    data: [1150.90, 1265.35, 1322.10, 1523.00, 1887.60, 1794.25, 1824.95],
                    borderColor: 'rgb(255, 215, 0)',
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    yAxisID: 'y'
                }, {
                    label: 'INR/USD Rate',
                    data: [67.19, 65.11, 68.39, 70.42, 74.13, 73.93, 76.23],
                    borderColor: 'rgb(100, 255, 218)',
                    backgroundColor: 'rgba(100, 255, 218, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Gold Price vs INR/USD Exchange Rate',
                        color: '#ffffff',
                        padding: 20,
                        font: {
                            size: 16,
                            family: "'IBM Plex Mono', monospace"
                        }
                    },
                    legend: {
                        labels: {
                            color: '#a0a0a0',
                            font: {
                                family: "'IBM Plex Mono', monospace"
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 15, 15, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#a0a0a0',
                        titleFont: {
                            family: "'IBM Plex Mono', monospace"
                        },
                        bodyFont: {
                            family: "'IBM Plex Mono', monospace"
                        },
                        padding: 12
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
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Gold Price (USD)',
                            color: '#ffffff',
                            font: {
                                family: "'IBM Plex Mono', monospace"
                            }
                        },
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
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'INR/USD Exchange Rate',
                            color: '#ffffff',
                            font: {
                                family: "'IBM Plex Mono', monospace"
                            }
                        },
                        grid: {
                            drawOnChartArea: false,
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#a0a0a0',
                            font: {
                                family: "'IBM Plex Mono', monospace"
                            }
                        }
                    }
                }
            }
        });
        
        console.log("Gold Rupee chart created successfully");
        chartFixed = true;
        
    } catch (error) {
        console.error("Error creating gold rupee chart:", error);
    }
}
