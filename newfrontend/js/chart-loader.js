// Standalone chart loader without API dependency
window.loadGoldRupeeChart = function(containerId) {
    const container = document.getElementById(containerId);
    if (!container || container.hasAttribute('data-chart-loaded')) {
        return;
    }
    
    const canvas = document.createElement('canvas');
    container.innerHTML = '';
    container.appendChild(canvas);
    container.style.height = '400px';
    
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
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
            plugins: {
                title: {
                    display: true,
                    text: 'Gold Price vs INR/USD Exchange Rate',
                    color: '#ffffff',
                    font: {
                        size: 16,
                        family: "'IBM Plex Mono', monospace"
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
    
    container.setAttribute('data-chart-loaded', 'true');
};
