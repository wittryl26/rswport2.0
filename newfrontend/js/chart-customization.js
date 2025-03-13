// Keep ONLY the working chart code, remove all experimental versions
(function() {
    console.log("Loading simplified gold-rupee chart implementation");
    
    // Make the chart function available globally
    window.loadGoldRupeeChart = function(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const canvas = document.createElement('canvas');
        container.innerHTML = '';
        container.appendChild(canvas);
        
        // Just create chart with static data - don't try to fetch from API
        new Chart(canvas, {
            type: 'line',
            data: {
                labels: ['2016', '2017', '2018', '2019', '2020', '2021', '2022'],
                datasets: [{
                    label: 'Gold Price (USD)',
                    data: [1150.90, 1265.35, 1322.10, 1523.00, 1887.60, 1794.25, 1824.95],
                    borderColor: 'rgb(255, 215, 0)',
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    yAxisID: 'y'
                }, {
                    label: 'INR/USD Rate',
                    data: [67.19, 65.11, 68.39, 70.42, 74.13, 73.93, 76.23],
                    borderColor: 'rgb(100, 255, 218)',
                    backgroundColor: 'rgba(100, 255, 218, 0.1)',
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: 'linear',
                        position: 'left',
                        title: { 
                            display: true,
                            text: 'Gold Price (USD)',
                            color: '#ffffff'
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
                            color: '#ffffff'
                        }
                    }
                }
            }
        });
        
        // Mark container as initialized
        container.setAttribute('data-initialized', 'true');
    };
})();

