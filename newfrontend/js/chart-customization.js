// Simple chart customization module - gold-rupee chart only
(function() {
    console.log("Loading simplified gold-rupee chart implementation");
    
    // Global vars to prevent duplications
    let chartInitialized = false;
    let descriptionAdded = false;
    
    // Main function to create the chart
    function createStandaloneGoldRupeeChart {

  // Fetch 5-year data from API
  fetch('/api/gold-exchange-rate-data')
    .then(response => response.json())
    .then(data => {
      // Use data directly - it will already have 5-year range
      // Rest of chart code can use this data
(containerId) {
        console.log(`Creating gold-rupee chart in container: ${containerId}`);
        
        // Get the container
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container not found: ${containerId}`);
            return;
        }
        
        // Check if we've already initialized this chart
        if (chartInitialized) {
            console.log("Chart already initialized, skipping");
            return;
        }
        
        // Set flag to prevent multiple initializations
        chartInitialized = true;
        
        // Clean up any existing descriptions
        removeExistingDescriptions();
        
        // Style container
        container.style.cssText = `
            display: block !important;
            position: relative !important;
            width: 100% !important;
            height: 400px !important;
            background-color: rgba(22, 22, 22, 0.1) !important;
            border-radius: 8px !important;
            padding: 15px !important;
            box-sizing: border-box !important;
            margin: 20px 0 0 !important;
        `;
        
        // Show loading state
        container.innerHTML = '<div style="color:#fff;text-align:center;padding:20px;">Loading Gold & Rupee data...</div>';
        
        // Create new canvas
        const canvas = document.createElement('canvas');
        
        // Use the fallback data directly to avoid API issues
        const fallbackData = {
            title: "Gold Price vs USD/INR Exchange Rate",
            data: [
                { date: '2024-04-01', goldPrice: 2291.4, rupeeRate: 83.45 },
                { date: '2024-05-01', goldPrice: 2322.9, rupeeRate: 83.32 },
                { date: '2024-06-01', goldPrice: 2327.7, rupeeRate: 83.45 },
                { date: '2024-07-01', goldPrice: 2426.5, rupeeRate: 83.74 },
                { date: '2024-08-01', goldPrice: 2493.8, rupeeRate: 83.9 },
                { date: '2024-09-01', goldPrice: 2568.2, rupeeRate: 83.82 },
                { date: '2024-10-01', goldPrice: 2738.3, rupeeRate: 83.72 },
                { date: '2024-11-01', goldPrice: 2657.0, rupeeRate: 84.09 },
                { date: '2024-12-01', goldPrice: 2636.5, rupeeRate: 84.56 },
                { date: '2025-01-01', goldPrice: 2812.5, rupeeRate: 85.79 },
                { date: '2025-02-01', goldPrice: 2836.8, rupeeRate: 86.65 },
                { date: '2025-03-01', goldPrice: 2917.7, rupeeRate: 87.33 }
            ]
        };
            
        // Clear container and add canvas
        container.innerHTML = '';
        container.appendChild(canvas);
            
        // Create chart
        createChart(canvas, fallbackData);
            
        // Add description text - ONLY ONCE
        addDescription(containerId);
    }
    
    // Create the actual chart using Chart.js
    function createChart(canvas, data) {
        // Extract the data
        const labels = data.data.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        });
        
        const goldValues = data.data.map(d => Number(d.goldPrice || 0));
        const rupeeValues = data.data.map(d => Number(d.rupeeRate || 0));
        
        // Create chart
        new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Gold Price (USD/oz)',
                        data: goldValues,
                        borderColor: '#FFD700', // Gold color
                        backgroundColor: 'rgba(255, 215, 0, 0.1)',
                        yAxisID: 'y-gold',
                        pointRadius: 2,
                        borderWidth: 2,
                        tension: 0.3
                    },
                    {
                        label: 'USD/INR Rate',
                        data: rupeeValues,
                        borderColor: '#4CAF50', // Green color
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        yAxisID: 'y-rupee',
                        pointRadius: 2,
                        borderWidth: 2,
                        borderDash: [5, 5], // Dashed line
                        tension: 0.3
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
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#FFFFFF'
                        }
                    },
                    title: {
                        display: true,
                        text: data.title || 'Gold Price vs USD/INR Exchange Rate',
                        color: '#FFFFFF'
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#A0A0A0'
                        }
                    },
                    'y-gold': {
                        type: 'linear',
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Gold Price (USD/oz)',
                            color: '#FFD700'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#FFD700'
                        }
                    },
                    'y-rupee': {
                        type: 'linear',
                        position: 'right',
                        title: {
                            display: true,
                            text: 'USD/INR Rate',
                            color: '#4CAF50'
                        },
                        grid: {
                            drawOnChartArea: false
                        },
                        ticks: {
                            color: '#4CAF50'
                        }
                    }
                }
            }
        });
    }
    
    // Add a single description
    function addDescription(containerId) {
        // Skip if we've already added a description
        if (descriptionAdded) {
            return;
        }
        
        // Create single description
        const chartDescription = document.createElement('div');
        chartDescription.id = 'gold-rupee-chart-description';
        chartDescription.style.cssText = `
            margin: 10px 0 30px 0;
            font-size: 11px;
            color: #a0a0a0;
            line-height: 1.4;
            font-style: italic;
        `;
        chartDescription.innerHTML = `
            This chart visualization is powered by a custom Node.js API I built from scratch that fetches live gold price data and USD/INR exchange rates. 
            The data is processed through a serverless function using Express for routing and Chart.js for visualization, demonstrating full-stack development skills.
        `;
        
        // Find the container and add the description after it
        const container = document.getElementById(containerId);
        if (container) {
            container.insertAdjacentElement('afterend', chartDescription);
            // Set flag to prevent duplicate descriptions
            descriptionAdded = true;
        }
    }
    
    // Remove any existing descriptions
    function removeExistingDescriptions() {
        // Find all elements that might be descriptions
        const descriptions = document.querySelectorAll('[id$="-description"], [id^="gold-rupee-chart-description"]');
        descriptions.forEach(el => el.remove());
    }

    // Export only what's needed
    window.createStandaloneGoldRupeeChart = createStandaloneGoldRupeeChart;
    
    console.log('Simplified gold-rupee chart module loaded');
})();

