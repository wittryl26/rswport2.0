/**
 * Modern Charts
 * Creates and manages all chart visualizations
 */

// Explicitly expose chart creation functions to global scope
window.createEconomicChart = createEconomicChart;
window.createFinancialChart = createFinancialChart;
window.createTrelloChart = createTrelloChart;

// New chart function for gold and rupee comparison
window.createGoldRupeeChart = createGoldRupeeChart;

// Clean up the chart creation functions - focus on economic chart
function createEconomicChart(canvas, data) {
    console.log('Creating economic chart with data:', data);
    
    try {
        // Data validation
        if (!data || !Array.isArray(data) || data.length === 0) {
            console.error('Invalid or empty economic data:', data);
            showChartError(canvas.parentElement, 'Invalid or empty economic data');
            return null;
        }
        
        // Process data for Chart.js format
        const chartData = processEconomicData(data);
        
        // Check for existing chart to prevent duplicates
        if (canvas.chart instanceof Chart) {
            canvas.chart.destroy();
        }
        
        // Simple economic line chart - clear config
        const chart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Economic Growth',
                    data: chartData.values,
                    borderColor: '#D4364A',
                    backgroundColor: 'rgba(212, 54, 74, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#ffffff'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Economic Growth Trend',
                        color: '#ffffff',
                        font: {
                            size: 16,
                            family: "'IBM Plex Mono', monospace",
                            weight: 'normal'
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#a0a0a0'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#a0a0a0'
                        },
                        title: {
                            display: true,
                            text: 'Growth Rate (%)',
                            color: '#a0a0a0'
                        }
                    }
                }
            }
        });
        
        // Store reference to chart on canvas to enable cleanup
        canvas.chart = chart;
        
        console.log('Economic chart created successfully');
        
        // Return the chart instance
        return chart;
    } catch (error) {
        console.error('Error creating economic chart:', error);
        showChartError(canvas.parentElement, error.message);
        return null;
    }
}

// Process economic data into chart format
function processEconomicData(data) {
    // Handle different data formats from API vs sample data
    const labels = [];
    const values = [];
    
    // Determine data format
    if (data[0] && data[0].date !== undefined && data[0].value !== undefined) {
        // Standard format (date and value properties)
        data.sort((a, b) => new Date(a.date) - new Date(b.date))
            .forEach(item => {
                labels.push(formatDate(item.date));
                values.push(parseFloat(item.value));
            });
    } else if (data[0] && data[0].date !== undefined && data[0].indicator !== undefined) {
        // Another format (date and indicator)
        data.sort((a, b) => new Date(a.date) - new Date(b.date))
            .forEach(item => {
                labels.push(formatDate(item.date));
                // Use value property if it exists, otherwise indicator
                const val = item.value !== undefined ? item.value : 
                          (typeof item.indicator === 'number' ? item.indicator : 0);
                values.push(parseFloat(val));
            });
    } else {
        // Fallback for unexpected format
        console.warn('Unexpected economic data format:', data[0]);
        data.forEach((item, index) => {
            // Just use index as label if we can't determine date
            labels.push(`Point ${index + 1}`);
            // Try to extract a numeric value
            const val = extractNumericValue(item);
            values.push(val);
        });
    }
    
    return { labels, values };
}

// Create financial data chart
function createFinancialChart(canvas, data) {
    console.log('Creating financial chart with data:', data);
    
    try {
        // Data validation
        if (!data || !Array.isArray(data) || data.length === 0) {
            console.error('Invalid or empty financial data:', data);
            showChartError(canvas.parentElement, 'Invalid or empty financial data');
            return null;
        }
        
        // Process data for Chart.js format
        const chartData = processFinancialData(data);
        
        // Create the chart
        const chart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [
                    {
                        label: 'Actual',
                        data: chartData.actualValues,
                        borderColor: '#D4364A',
                        backgroundColor: 'rgba(0,0,0,0)',
                        borderWidth: 2,
                        tension: 0.2,
                        pointRadius: 3
                    },
                    {
                        label: 'Predicted',
                        data: chartData.predictedValues,
                        borderColor: '#7928ca',
                        backgroundColor: 'rgba(0,0,0,0)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        tension: 0.2,
                        pointRadius: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    },
                    title: {
                        display: true,
                        text: 'Financial Risk Analysis',
                        color: '#ffffff',
                        font: {
                            size: 16,
                            family: "'IBM Plex Mono', monospace",
                            weight: 'normal'
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#a0a0a0',
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#a0a0a0'
                        },
                        title: {
                            display: true,
                            text: 'Value',
                            color: '#a0a0a0'
                        }
                    }
                }
            }
        });
        
        console.log('Financial chart created successfully');
        return chart;
    } catch (error) {
        console.error('Error creating financial chart:', error);
        showChartError(canvas.parentElement, error.message);
        return null;
    }
}

// Process financial data into chart format
function processFinancialData(data) {
    const labels = [];
    const actualValues = [];
    const predictedValues = [];
    
    // Sort by date if dates are present
    if (data[0] && data[0].date) {
        data.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    
    // Extract data points
    data.forEach(item => {
        // Handle date
        if (item.date) {
            labels.push(formatDate(item.date));
        } else {
            labels.push(`Point ${labels.length + 1}`);
        }
        
        // Handle actual and predicted values
        if (item.actual !== undefined) {
            actualValues.push(parseFloat(item.actual));
        } else {
            actualValues.push(extractNumericValue(item, 'actual'));
        }
        
        if (item.predicted !== undefined) {
            predictedValues.push(parseFloat(item.predicted));
        } else {
            predictedValues.push(extractNumericValue(item, 'predicted'));
        }
    });
    
    return { labels, actualValues, predictedValues };
}

// Create Trello status chart
function createTrelloChart(canvas, data) {
    console.log('Creating Trello chart with data:', data);
    
    try {
        // Data validation
        if (!data || !Array.isArray(data) || data.length === 0) {
            console.error('Invalid or empty Trello data:', data);
            showChartError(canvas.parentElement, 'Invalid or empty Trello data');
            return null;
        }
        
        // Process data for Chart.js format
        const chartData = processTrelloData(data);
        
        // Create the chart
        const chart = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: chartData.labels,
                datasets: [{
                    data: chartData.values,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: {
                                family: "'IBM Plex Mono', monospace",
                                size: 12
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Task Status Distribution',
                        color: '#ffffff',
                        font: {
                            size: 16,
                            family: "'IBM Plex Mono', monospace",
                            weight: 'normal'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        console.log('Trello chart created successfully');
        return chart;
    } catch (error) {
        console.error('Error creating Trello chart:', error);
        showChartError(canvas.parentElement, error.message);
        return null;
    }
}

// Create gold and rupee comparison chart
function createGoldRupeeChart(canvas, data) {
    console.log('Creating gold price and rupee chart with data:', data);
    
    try {
        // Data validation with more detailed logging
        if (!data || !data.data || !Array.isArray(data.data)) {
            console.error('Invalid data structure:', data);
            return;
        }
        
        console.log(`Processing ${data.data.length} data points`);
        
        // Ensure proper date filtering
        const now = new Date();
        const fiveYearsAgo = new Date(now);
        fiveYearsAgo.setFullYear(now.getFullYear() - 5);
        
        // Filter and sort data
        const filteredData = data.data
            .filter(item => new Date(item.date) >= fiveYearsAgo)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
            
        console.log(`Filtered to ${filteredData.length} points within 5-year range`);
        
        // Process data for chart
        const chartData = {
            labels: filteredData.map(item => new Date(item.date).toLocaleDateString('en-US', {
                year: '2-digit',
                month: 'short'
            })),
            goldValues: filteredData.map(item => parseFloat(item.goldPrice || item.gold_price || 0)),
            rupeeValues: filteredData.map(item => parseFloat(item.rupeeRate || item.rupee_rate || 0))
        };
        
        // Clear any existing chart
        if (canvas.chart) {
            canvas.chart.destroy();
        }
        
        // Create new chart with updated configuration
        const chart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [
                    {
                        label: 'Gold Price (USD/oz)',
                        data: chartData.goldValues,
                        borderColor: '#D4A017',
                        backgroundColor: 'rgba(212, 160, 23, 0.1)',
                        borderWidth: 2,
                        tension: 0.3,
                        yAxisID: 'y-gold',
                        fill: false
                    },
                    {
                        label: 'USD/INR Rate',
                        data: chartData.rupeeValues,
                        borderColor: '#2E8B57',
                        backgroundColor: 'rgba(46, 139, 87, 0.1)',
                        borderWidth: 2,
                        tension: 0.3,
                        yAxisID: 'y-rupee',
                        fill: false
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
                        text: 'Gold Price vs USD/INR Exchange Rate (5 Year Trend)',
                        color: '#ffffff',
                        font: {
                            size: 16,
                            weight: 'normal'
                        }
                    },
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#a0a0a0',
                            maxRotation: 45,
                            minRotation: 45,
                            autoSkip: true,
                            maxTicksLimit: 12,
                            callback: function(val, index) {
                                const date = new Date(filteredData[index]?.date);
                                if (!isNaN(date.getTime())) {
                                    return date.toLocaleDateString('en-US', {
                                        year: '2-digit',
                                        month: 'short'
                                    });
                                }
                                return '';
                            }
                        }
                    },
                    'y-gold': {
                        position: 'left',
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#D4A017',
                            callback: value => `$${value}`
                        },
                        title: {
                            display: true,
                            text: 'Gold Price (USD/oz)',
                            color: '#D4A017'
                        }
                    },
                    'y-rupee': {
                        position: 'right',
                        grid: {
                            drawOnChartArea: false
                        },
                        ticks: {
                            color: '#2E8B57'
                        },
                        title: {
                            display: true,
                            text: 'USD/INR Rate',
                            color: '#2E8B57'
                        }
                    }
                }
            }
        });
        
        // Store chart reference
        canvas.chart = chart;
        
        // Prevent fallback to sample data by marking as initialized
        canvas.setAttribute('data-initialized', 'true');
        
        return chart;
    } catch (error) {
        console.error('Error creating gold-rupee chart:', error);
        showChartError(canvas.parentElement, error.message);
    }
}

// Fix the processGoldRupeeData function to handle the data format correctly
function processGoldRupeeData(data) {
    const labels = [];
    const goldValues = [];
    const rupeeValues = [];
    
    console.log('Processing gold-rupee data:', data);
    
    // Process data and sort by date
    try {
        // Sort by date for consistent display
        data.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        data.forEach(item => {
            labels.push(formatDate(item.date));
            
            // Handle different property names that might be in the data
            if (item.goldPrice !== undefined) {
                goldValues.push(parseFloat(item.goldPrice));
            } else if (item.gold_price !== undefined) {
                goldValues.push(parseFloat(item.gold_price));
            } else {
                goldValues.push(0);
                console.warn('No gold price found in item:', item);
            }
            
            if (item.rupeeRate !== undefined) {
                rupeeValues.push(parseFloat(item.rupeeRate));
            } else if (item.rupee_rate !== undefined) {
                rupeeValues.push(parseFloat(item.rupee_rate));
            } else {
                rupeeValues.push(0);
                console.warn('No rupee rate found in item:', item);
            }
        });
    } catch (error) {
        console.error('Error processing gold-rupee data:', error);
    }
    
    console.log('Processed data:', { labels, goldValues, rupeeValues });
    return { labels, goldValues, rupeeValues };
}

// Process Trello data into chart format
function processTrelloData(data) {
    // Count tasks by status
    const statusCounts = {};
    
    data.forEach(item => {
        let status;
        
        // Try different properties to find status
        if (item.status) {
            status = item.status;
        } else if (item.list_name) {
            status = item.list_name;
        } else {
            status = 'Unknown';
        }
        
        statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    // Convert to arrays for Chart.js
    const labels = Object.keys(statusCounts);
    const values = Object.values(statusCounts);
    
    return { labels, values };
}

// Helper function to format dates consistently
function formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return dateString; // Return original if invalid
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Extract numeric value from an object
function extractNumericValue(item, preferredKey = null) {
    // If preferredKey is provided, try that first
    if (preferredKey && item[preferredKey] !== undefined) {
        const value = parseFloat(item[preferredKey]);
        if (!isNaN(value)) return value;
    }
    
    // Try common keys
    const numericKeys = ['value', 'amount', 'count', 'total', 'figure', 'number'];
    for (const key of numericKeys) {
        if (item[key] !== undefined) {
            const value = parseFloat(item[key]);
            if (!isNaN(value)) return value;
        }
    }
    
    // Look for any numeric property
    for (const key in item) {
        if (typeof item[key] === 'number') {
            return item[key];
        }
        if (typeof item[key] === 'string') {
            const value = parseFloat(item[key]);
            if (!isNaN(value)) return value;
        }
    }
    
    // Last resort - return random value between 1-100
    console.warn('Could not extract numeric value from item:', item);
    return Math.floor(Math.random() * 100) + 1;
}

// Show error message in chart container
function showChartError(container, message) {
    if (!container) return;
    
    container.innerHTML = `
        <div style="
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 1rem;
        ">
            <div style="color: #D4364A; font-size: 1.2rem; margin-bottom: 0.5rem;">
                Chart Error
            </div>
            <div style="color: #a0a0a0; font-size: 0.9rem;">
                ${message}
            </div>
            <button onclick="reloadChart(this.parentElement.parentElement)" style="
                margin-top: 1rem;
                background: #333;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 4px;
                cursor: pointer;
                font-family: var(--font-code);
            ">
                Reload Chart
            </button>
        </div>
    `;
}

// Global function to reload a specific chart
window.reloadChart = function(container) {
    console.log('Reloading chart in container:', container);
    
    // Find the chart ID from the container
    const chartId = container.id;
    if (!chartId) {
        console.error('Chart container has no ID');
        return;
    }
    
    // Check if this is a specialized chart - if so, use specific reload function
    if (container.getAttribute('data-chart-type') === 'gold-rupee') {
        console.log('Detected gold-rupee chart, using specialized reload function');
        window.reloadGoldRupeeChart(chartId);
        return;
    }
    
    // Clear container
    container.innerHTML = '<div style="height: 100%; display: flex; justify-content: center; align-items: center; color: var(--text-secondary);">Reloading chart...</div>';
    
    // Determine chart type from ID
    const projectId = chartId.split('-')[1];
    const endpoint = projectId === "1" ? "econ-data" : 
                    projectId === "3" ? "financial" : "trello";
    
    // Create new canvas
    setTimeout(() => {
        const canvas = document.createElement('canvas');
        container.innerHTML = '';
        container.appendChild(canvas);
        
        // Get chart data and recreate
        if (window.FORCE_SAMPLE_DATA && window.sampleDataProvider) {
            console.log(`Using sample data for ${endpoint}`);
            
            let dataPromise;
            if (endpoint === 'econ-data') {
                dataPromise = window.sampleDataProvider.getEconomicData();
            } else if (endpoint === 'financial') {
                dataPromise = window.sampleDataProvider.getFinancialData();
            } else {
                dataPromise = window.sampleDataProvider.getTrelloData();
            }
            
            dataPromise.then(data => {
                // Look up the appropriate chart creation function
                const chartFunctions = {
                    'econ-data': createEconomicChart,
                    'financial': createFinancialChart,
                    'trello': createTrelloChart
                };
                
                if (typeof chartFunctions[endpoint] === 'function') {
                    chartFunctions[endpoint](canvas, data);
                }
            });
        } else if (window.apiService) {
            console.log(`Using API data for ${endpoint}`);
            
            let dataPromise;
            if (endpoint === 'econ-data') {
                dataPromise = window.apiService.getEconomicData();
            } else if (endpoint === 'financial') {
                dataPromise = window.apiService.getFinancialData();
            } else {
                dataPromise = window.apiService.getTrelloData();
            }
            
            dataPromise.then(data => {
                // Look up the appropriate chart creation function
                const chartFunctions = {
                    'econ-data': createEconomicChart,
                    'financial': createFinancialChart,
                    'trello': createTrelloChart
                };
                
                if (typeof chartFunctions[endpoint] === 'function') {
                    chartFunctions[endpoint](canvas, data);
                }
            });
        }
    }, 500);
};

// Debug log to verify script loaded
console.log('Modern charts module loaded, Chart.js available:', typeof Chart !== 'undefined');

// Initialize sample data provider if needed
document.addEventListener('DOMContentLoaded', function() {
    // Check for sample data provider
    if (!window.sampleDataProvider && typeof SampleDataProvider === 'function') {
        console.log('Initializing sample data provider');
        window.sampleDataProvider = new SampleDataProvider();
    }
});

// Add new function to initialize the gold-rupee chart
function initializeGoldRupeeChart(containerId) {
    console.log(`Initializing gold-rupee chart: ${containerId}`);
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Gold-rupee chart container not found: ${containerId}`);
        return;
    }
    
    // Loading state
    container.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100%;color:var(--text-secondary);">Loading gold price data...</div>';
    
    // Try to get data
    const dataPromise = window.sampleDataProvider 
        ? window.sampleDataProvider.getGoldRupeeData() 
        : (window.apiService ? window.apiService.getGoldRupeeData() : Promise.reject('No data source available'));
    
    dataPromise
        .then(data => {
            // Create canvas
            container.innerHTML = '';
            const canvas = document.createElement('canvas');
            container.appendChild(canvas);
            
            // Create chart
            createGoldRupeeChart(canvas, data);
        })
        .catch(error => {
            console.error('Error loading gold-rupee data:', error);
            container.innerHTML = `
                <div class="chart-error">
                    <div>Failed to load gold price data</div>
                    <button onclick="reloadChart(this.parentElement.parentElement)" class="chart-reload-btn">Try Again</button>
                </div>
            `;
        });
}

// Make the function available globally
window.initializeGoldRupeeChart = initializeGoldRupeeChart;

// Update the createStandaloneGoldRupeeChart function to add a description below the chart
window.createStandaloneGoldRupeeChart = function(containerId) {
    console.log(`Creating standalone gold-rupee chart in container: ${containerId}`);
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container not found: ${containerId}`);
        return;
    }
    
    // Style container with clean styling (no borders)
    container.style.cssText = `
        display: block !important;
        position: relative !important;
        width: 100% !important;
        height: 400px !important;
        background-color: rgba(22, 22, 22, 0.1) !important;
        border-radius: 8px !important;
        padding: 15px !important;
        box-sizing: border-box !important;
        margin: 20px 0 !important;
    `;
    
    // Show loading state
    container.innerHTML = '<div style="color:#fff;text-align:center;padding:20px;">Loading Gold & Rupee data from API...</div>';
    
    // Create canvas - but don't add it until we have data
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
        display: block !important;
        width: 100% !important;
        height: 100% !important;
    `;
    
    // Use the correct absolute URL for the API
    const apiUrl = '/api/gold-rupee';
    
    // Fetch the data from API endpoint
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("API data received for gold-rupee:", data);
            
            // Clear container and add canvas
            container.innerHTML = '';
            container.appendChild(canvas);
            
            // Create chart with API data
            createGoldRupeeChart(canvas, data);
            
            // Add small description below chart
            const chartDescription = document.createElement('div');
            chartDescription.style.cssText = `
                margin-top: 10px; 
                font-size: 11px;
                color: #a0a0a0;
                line-height: 1.4;
                font-style: italic;
                padding: 0 5px;
            `;
            chartDescription.innerHTML = `
                This chart visualization is powered by a custom Node.js API I built from scratch that fetches live gold price data and USD/INR exchange rates. 
                The data is processed through a serverless function using Express for routing and Chart.js for visualization, demonstrating full-stack development skills.
            `;
            
            // Add the description after the container
            container.parentNode.insertBefore(chartDescription, container.nextSibling);
            
            // Mark container as rendered
            container.setAttribute('data-chart-status', 'rendered');
        })
        .catch(error => {
      console.error("Error fetching gold-rupee data:", error);
      
      // Use sample data as fallback
      console.log("Using sample data fallback for gold-rupee chart");
      
      // Clear container and add canvas for the fallback data
      container.innerHTML = '';
      const canvas = document.createElement('canvas');
      container.appendChild(canvas);
      
      // Try to get sample data from sampleDataProvider
      if (window.sampleDataProvider && typeof window.sampleDataProvider.getGoldRupeeData === 'function') {
        window.sampleDataProvider.getGoldRupeeData()
          .then(fallbackData => {
            console.log("Using sample data for gold-rupee chart");
            createGoldRupeeChart(canvas, fallbackData);
            
            // Add fallback notice
            const fallbackNotice = document.createElement('div');
            fallbackNotice.style.cssText = 'font-size: 11px; color: #ff6b6b; margin-top: 5px;';
            fallbackNotice.textContent = 'Using offline sample data (API unavailable)';
            canvas.parentNode.insertBefore(fallbackNotice, canvas.nextSibling);
          });
      } else {
        console.error("No sample data provider available for fallback");
        container.innerHTML = '<div style="padding: 20px; color: #ff6b6b;">Could not load chart data</div>';
      }
      
      // Keep the description section
      const chartDescription = document.createElement('div');
      chartDescription.style.cssText = `
          margin-top: 10px; 
          font-size: 11px;
          color: #a0a0a0;
          line-height: 1.4;
          font-style: italic;
          padding: 0 5px;
      `;
      chartDescription.innerHTML = `
          This chart visualization is powered by a custom Node.js API I built from scratch that fetches live gold price data and USD/INR exchange rates. 
          The data is processed through a serverless function using Express for routing and Chart.js for visualization, demonstrating full-stack development skills.
      `;
      
      // Add the description after the container
      container.parentNode.insertBefore(chartDescription, container.nextSibling);
    });
};

// Update the standalone chart creation to prevent fallback
window.createStandaloneGoldRupeeChart = function(containerId) {
    console.log(`Creating standalone gold-rupee chart in container: ${containerId}`);
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container not found: ${containerId}`);
        return;
    }
    
    // Show loading state
    container.innerHTML = '<div style="padding:20px;text-align:center;color:#fff;">Loading data...</div>';
    
    const apiUrl = '/api/gold-rupee';
    let retryCount = 0;
    const maxRetries = 3;
    
    function fetchWithRetry() {
        fetch(apiUrl, {
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            }
        })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            // Clear container and create canvas
            container.innerHTML = '';
            const canvas = document.createElement('canvas');
            container.appendChild(canvas);
            
            // Create chart and store reference
            const chart = createGoldRupeeChart(canvas, data);
            container._chart = chart;
            
            // Prevent any further reinitialization
            container.setAttribute('data-chart-initialized', 'true');
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            if (retryCount < maxRetries) {
                retryCount++;
                console.log(`Retrying (${retryCount}/${maxRetries})...`);
                setTimeout(fetchWithRetry, 1000 * retryCount);
            } else {
                container.innerHTML = `
                    <div style="color:#ff6b6b;padding:20px;text-align:center;">
                        Failed to load data after ${maxRetries} attempts.<br>
                        <button onclick="window.createStandaloneGoldRupeeChart('${containerId}')" 
                                style="margin-top:10px;padding:5px 10px;cursor:pointer;">
                            Try Again
                        </button>
                    </div>`;
            }
        });
    }
    
    fetchWithRetry();
};

function createGoldRupeeChart(containerId) {
  console.log('Initializing Gold-Rupee chart...');
  
  // Fetch data from API with retry logic
  const fetchData = async (retries = 3) => {
    try {
      const response = await fetch('/api/gold-rupee', {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error(`API returned ${response.status}`);
      
      const data = await response.json();
      console.log('Received API data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      if (retries > 0) {
        console.log(`Retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchData(retries - 1);
      }
      return null;
    }
  };

  // Process the data for chart display
  const processData = (rawData) => {
    if (!rawData) return null;
    
    let dataArray = rawData.data || rawData;
    if (!Array.isArray(dataArray)) {
      console.error('Invalid data format:', rawData);
      return null;
    }

    // Sort by date ascending
    dataArray.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Filter for last 5 years
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    
    dataArray = dataArray.filter(item => new Date(item.date) >= fiveYearsAgo);
    
    return {
      labels: dataArray.map(item => new Date(item.date).toLocaleDateString()),
      goldData: dataArray.map(item => parseFloat(item.goldPrice)),
      rupeeData: dataArray.map(item => parseFloat(item.rupeeRate))
    };
  };

  // Create and configure the chart
  const createChart = (processedData) => {
    const ctx = document.getElementById(containerId).getContext('2d');
    
    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: processedData.labels,
        datasets: [
          {
            label: 'Gold Price (USD)',
            data: processedData.goldData,
            borderColor: 'rgb(255, 215, 0)',
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
            yAxisID: 'y-gold'
          },
          {
            label: 'USD/INR Rate',
            data: processedData.rupeeData,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            yAxisID: 'y-rupee'
          }
        ]
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: '5-Year Range'
            },
            ticks: {
              maxTicksLimit: 12,
              callback: function(value, index) {
                // Show fewer x-axis labels for clarity
                const date = new Date(this.getLabelForValue(value));
                return date.toLocaleDateString('en-US', { 
                  year: '2-digit',
                  month: 'short'
                });
              }
            }
          },
          'y-gold': {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Gold Price (USD)'
            }
          },
          'y-rupee': {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'USD/INR Rate'
            },
            grid: {
              drawOnChartArea: false
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Gold Price vs. USD/INR Exchange Rate'
          },
          tooltip: {
            callbacks: {
              title: function(tooltipItems) {
                return new Date(tooltipItems[0].label).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });
              }
            }
          }
        }
      }
    });
  };

  // Initialize the chart
  (async () => {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container ${containerId} not found`);
      return;
    }

    container.innerHTML = '<canvas></canvas>';
    
    const data = await fetchData();
    if (!data) {
      console.error('Failed to fetch data from API');
      return;
    }

    const processedData = processData(data);
    if (!processedData) {
      console.error('Failed to process data');
      return;
    }

    console.log('Creating chart with processed data:', processedData);
    createChart(processedData);
  })();
}
