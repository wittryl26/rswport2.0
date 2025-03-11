/**
 * Fixed chart implementation with correct data and placement
 */

document.addEventListener('DOMContentLoaded', function() {
    // Wait for project cards to load first
    setTimeout(initializeFixedChart, 1000);
});

function initializeFixedChart() {
    console.log("Initializing fixed chart");
    
    // Find or create the chart container in the first project card
    const firstProjectCard = document.querySelector('.card');
    if (!firstProjectCard) {
        console.error("No project cards found to add chart to");
        insertChartBeforeProjects(); // Fallback placement
        return;
    }
    
    // Create chart container
    let chartContainer = document.createElement('div');
    chartContainer.id = 'gold-rupee-chart';
    chartContainer.className = 'chart-container';
    
    // Insert it into the first card
    const cardContent = firstProjectCard.querySelector('.card-content');
    if (cardContent) {
        cardContent.prepend(chartContainer);
    } else {
        firstProjectCard.prepend(chartContainer);
    }
    
    // Create canvas
    const canvas = document.createElement('canvas');
    chartContainer.appendChild(canvas);
    
    // Create chart with correct data structure
    try {
        new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['2017', '2018', '2019', '2020', '2021', '2022', '2023'],
                datasets: [
                    {
                        label: 'Gold Price (USD)',
                        data: [1265, 1295, 1390, 1684, 1804, 1795, 1932],
                        borderColor: '#f7df00', // Gold color
                        backgroundColor: 'rgba(247, 223, 0, 0.1)',
                        yAxisID: 'y',
                        tension: 0.4,
                        borderWidth: 2
                    },
                    {
                        label: 'INR/USD Rate',
                        data: [65.12, 68.47, 70.39, 74.13, 73.77, 76.21, 82.04],
                        borderColor: 'rgba(100, 255, 218, 1)',
                        backgroundColor: 'rgba(100, 255, 218, 0.1)',
                        yAxisID: 'y1',
                        tension: 0.4,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Gold Price vs. INR/USD Exchange Rate',
                        color: '#ffffff',
                        font: {
                            family: "'IBM Plex Mono', monospace",
                            size: 16,
                            weight: 'normal'
                        },
                        padding: {
                            bottom: 20
                        }
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            color: '#a0a0a0',
                            font: {
                                family: "'IBM Plex Mono', monospace"
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 15, 15, 0.9)',
                        titleFont: {
                            family: "'IBM Plex Mono', monospace"
                        },
                        bodyFont: {
                            family: "'IBM Plex Mono', monospace"
                        },
                        borderColor: 'rgba(100, 255, 218, 0.3)',
                        borderWidth: 1,
                        padding: 10
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
                        position: 'left',
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
                            color: '#f7df00',
                            font: {
                                family: "'IBM Plex Mono', monospace"
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        grid: {
                            drawOnChartArea: false
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
                            color: '#64ffda',
                            font: {
                                family: "'IBM Plex Mono', monospace"
                            }
                        }
                    }
                }
            }
        });
        
        console.log("Chart created successfully in the correct position");
        
        // Add a descriptive text below the chart
        const description = document.createElement('p');
        description.className = 'card-description';
        description.innerHTML = 'This chart visualizes the relationship between Gold Price in USD and the INR/USD exchange rate over the past 7 years, showcasing the correlation between these financial indicators.';
        chartContainer.after(description);
        
    } catch (error) {
        console.error("Error creating chart:", error);
    }
}

// Fallback placement if no project cards exist yet
function insertChartBeforeProjects() {
    console.log("Using fallback chart placement");
    
    // Find projects section
    const projectsSection = document.getElementById('projects');
    if (!projectsSection) {
        console.error("Could not find projects section");
        return;
    }
    
    // Create container
    const container = document.createElement('div');
    container.className = 'chart-section';
    container.style.marginBottom = '3rem';
    
    // Add a title
    const title = document.createElement('h2');
    title.textContent = 'Financial Data Visualization';
    title.style.marginBottom = '1.5rem';
    title.style.fontSize = '2rem';
    title.style.fontWeight = '400';
    container.appendChild(title);
    
    // Create chart container
    const chartContainer = document.createElement('div');
    chartContainer.id = 'gold-rupee-chart';
    chartContainer.className = 'chart-container';
    container.appendChild(chartContainer);
    
    // Insert before projects section
    projectsSection.parentNode.insertBefore(container, projectsSection);
    
    // Create the chart
    const canvas = document.createElement('canvas');
    chartContainer.appendChild(canvas);
    
    // Create chart with same configuration as above
    try {
        new Chart(canvas.getContext('2d'), {
            /* Same configuration as above function */
            // Chart configuration omitted for brevity - same as above
            type: 'line',
            data: {
                labels: ['2017', '2018', '2019', '2020', '2021', '2022', '2023'],
                datasets: [
                    {
                        label: 'Gold Price (USD)',
                        data: [1265, 1295, 1390, 1684, 1804, 1795, 1932],
                        borderColor: '#f7df00',
                        backgroundColor: 'rgba(247, 223, 0, 0.1)',
                        yAxisID: 'y',
                        tension: 0.4,
                        borderWidth: 2
                    },
                    {
                        label: 'INR/USD Rate',
                        data: [65.12, 68.47, 70.39, 74.13, 73.77, 76.21, 82.04],
                        borderColor: 'rgba(100, 255, 218, 1)',
                        backgroundColor: 'rgba(100, 255, 218, 0.1)',
                        yAxisID: 'y1',
                        tension: 0.4,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                // Same options as above
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Gold Price vs. INR/USD Exchange Rate',
                        color: '#ffffff',
                        font: {
                            family: "'IBM Plex Mono', monospace",
                            size: 16,
                            weight: 'normal'
                        }
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            color: '#a0a0a0',
                            font: {
                                family: "'IBM Plex Mono', monospace"
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Gold Price (USD)',
                            color: '#f7df00'
                        }
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        grid: {
                            drawOnChartArea: false
                        },
                        title: {
                            display: true,
                            text: 'INR/USD Rate',
                            color: '#64ffda'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error in fallback chart creation:", error);
    }
}

// Also run on window load for redundancy
window.addEventListener('load', function() {
    setTimeout(initializeFixedChart, 1500);
});
