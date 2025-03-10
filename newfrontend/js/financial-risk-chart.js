// Financial Risk Analysis interactive chart

document.addEventListener('DOMContentLoaded', function() {
    // Find all financial risk chart containers
    const chartContainers = document.querySelectorAll('.chart-container[id="chart-3"]');
    
    if (chartContainers.length === 0) return;
    
    chartContainers.forEach(container => {
        // Add class for styling
        container.classList.add('financial-risk-chart');
        
        // Create interactive elements
        createInteractiveFinancialChart(container);
    });
    
    function createInteractiveFinancialChart(container) {
        console.log('Creating interactive financial risk chart');
        
        // Create UI elements
        const controls = document.createElement('div');
        controls.className = 'chart-controls';
        controls.innerHTML = `
            <div class="control-group">
                <label for="risk-level">Risk Level:</label>
                <input type="range" id="risk-level" min="1" max="10" value="5" class="slider">
                <span class="slider-value">5</span>
            </div>
            <div class="control-group">
                <label for="time-horizon">Time Horizon (months):</label>
                <input type="range" id="time-horizon" min="3" max="24" value="12" class="slider">
                <span class="slider-value">12</span>
            </div>
            <button class="recalculate-btn">Recalculate Risk</button>
        `;
        
        // Create canvas for chart
        const chartWrapper = document.createElement('div');
        chartWrapper.className = 'chart-wrapper';
        
        const canvas = document.createElement('canvas');
        chartWrapper.appendChild(canvas);
        
        // Clear container and add new elements
        container.innerHTML = '';
        container.appendChild(controls);
        container.appendChild(chartWrapper);
        
        // Initialize chart with default values
        let financialChart;
        let riskLevel = 5;
        let timeHorizon = 12;
        
        // Get slider elements
        const riskSlider = controls.querySelector('#risk-level');
        const timeSlider = controls.querySelector('#time-horizon');
        const riskValue = riskSlider.nextElementSibling;
        const timeValue = timeSlider.nextElementSibling;
        const recalculateBtn = controls.querySelector('.recalculate-btn');
        
        // Update slider values
        riskSlider.addEventListener('input', function() {
            riskValue.textContent = this.value;
            riskLevel = parseInt(this.value);
        });
        
        timeSlider.addEventListener('input', function() {
            timeValue.textContent = this.value;
            timeHorizon = parseInt(this.value);
        });
        
        // Recalculate button
        recalculateBtn.addEventListener('click', function() {
            updateChart(riskLevel, timeHorizon);
            
            // Add animated effect to button
            this.classList.add('clicked');
            setTimeout(() => {
                this.classList.remove('clicked');
            }, 300);
        });
        
        // Initial chart creation
        createChart(5, 12);
        
        // Function to create the chart
        function createChart(risk, months) {
            // Generate sample data based on risk and time horizon
            const data = generateRiskData(risk, months);
            
            // Create chart
            financialChart = new Chart(canvas, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [
                        {
                            label: 'Predicted Return',
                            data: data.predicted,
                            borderColor: '#7928ca',
                            backgroundColor: 'rgba(121, 40, 202, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4
                        },
                        {
                            label: 'Upper Bound (95% Confidence)',
                            data: data.upperBound,
                            borderColor: 'rgba(121, 40, 202, 0.3)',
                            borderWidth: 1,
                            borderDash: [5, 5],
                            fill: false,
                            tension: 0.4
                        },
                        {
                            label: 'Lower Bound (95% Confidence)',
                            data: data.lowerBound,
                            borderColor: 'rgba(121, 40, 202, 0.3)',
                            borderWidth: 1,
                            borderDash: [5, 5],
                            fill: false,
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: `Financial Risk Analysis (Risk: ${risk}/10, Horizon: ${months} months)`,
                            color: '#ffffff',
                            font: { size: 16, family: "'IBM Plex Mono', monospace" }
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) label += ': ';
                                    if (context.parsed.y !== null) {
                                        label += new Intl.NumberFormat('en-US', {
                                            style: 'percent',
                                            minimumFractionDigits: 2
                                        }).format(context.parsed.y / 100);
                                    }
                                    return label;
                                }
                            }
                        },
                        legend: {
                            labels: { color: '#ffffff' }
                        }
                    },
                    scales: {
                        x: {
                            title: { display: true, text: 'Time (Months)', color: '#a0a0a0' },
                            ticks: { color: '#a0a0a0' },
                            grid: { color: 'rgba(255, 255, 255, 0.05)' }
                        },
                        y: {
                            title: { display: true, text: 'Return (%)', color: '#a0a0a0' },
                            ticks: { 
                                color: '#a0a0a0',
                                callback: function(value) { return value + '%'; }
                            },
                            grid: { color: 'rgba(255, 255, 255, 0.05)' }
                        }
                    }
                }
            });
        }
        
        // Function to update the chart
        function updateChart(risk, months) {
            // Generate new data
            const data = generateRiskData(risk, months);
            
            // Update datasets
            financialChart.data.labels = data.labels;
            financialChart.data.datasets[0].data = data.predicted;
            financialChart.data.datasets[1].data = data.upperBound;
            financialChart.data.datasets[2].data = data.lowerBound;
            
            // Update chart title
            financialChart.options.plugins.title.text = 
                `Financial Risk Analysis (Risk: ${risk}/10, Horizon: ${months} months)`;
            
            // Update the chart
            financialChart.update();
        }
        
        // Function to generate sample data
        function generateRiskData(risk, months) {
            const labels = Array.from({length: months}, (_, i) => `Month ${i+1}`);
            const baseReturn = 5 + risk * 2; // Higher risk = higher potential return
            const volatility = risk * 1.5; // Higher risk = higher volatility
            
            // Generate data points with some randomness but following a trend
            const predicted = [];
            const upperBound = [];
            const lowerBound = [];
            
            let currentValue = 0;
            
            for (let i = 0; i < months; i++) {
                // Add some randomness but ensure an upward trend (usually)
                const monthlyChange = (Math.random() - 0.3) * volatility;
                currentValue += baseReturn / months + monthlyChange;
                
                // Ensure the value stays reasonable
                currentValue = Math.max(-30, Math.min(50, currentValue));
                
                predicted.push(currentValue);
                
                // Calculate confidence bounds based on risk & time
                const confidenceBand = volatility * Math.sqrt(i+1) * 0.5;
                upperBound.push(currentValue + confidenceBand);
                lowerBound.push(currentValue - confidenceBand);
            }
            
            return { labels, predicted, upperBound, lowerBound };
        }
    }
});