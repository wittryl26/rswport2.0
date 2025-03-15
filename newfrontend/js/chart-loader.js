// Dedicated chart loader
window.loadGoldRupeeChart = function(containerId) {
    console.log('Loading chart in container:', containerId);
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Chart container not found:', containerId);
        return;
    }

    // Create fresh canvas
    const canvas = document.createElement('canvas');
    container.innerHTML = '';
    container.appendChild(canvas);
    
    // Create chart with static data
    try {
        new Chart(canvas, {
            type: 'line',
            data: {
                labels: ['2016', '2017', '2018', '2019', '2020', '2021', '2022'],
                datasets: [{
                    label: 'Gold Price (USD)',
                    data: [1150.90, 1265.35, 1322.10, 1523.00, 1887.60, 1794.25, 1824.95],
                    borderColor: '#FFD700',
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    yAxisID: 'y'
                }, {
                    label: 'INR/USD Rate',
                    data: [67.19, 65.11, 68.39, 70.42, 74.13, 73.93, 76.23],
                    borderColor: '#64ffda',
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
                            color: '#FFD700'
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
        console.log('Chart created successfully');
    } catch (error) {
        console.error('Error creating chart:', error);
    }
};
