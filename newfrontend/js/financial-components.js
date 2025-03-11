/**
 * Financial Model Components
 * Generated merge
 * Merged on: 2025-03-11T00:02:03.117Z
 */


// ===============================================
// Source: financial-model-loader.js
// ===============================================

/**
 * Financial Model Loader
 * Loads and initializes financial model spreadsheets in the portfolio
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Financial model loader initializing');
    
    // Initialize financial models after a short delay to ensure containers exist
    setTimeout(() => {
        // Look for existing containers to initialize
        const containers = document.querySelectorAll('.financial-spreadsheet');
        
        if (containers.length > 0) {
            console.log(`Found ${containers.length} financial spreadsheet containers`);
            
            containers.forEach(container => {
                const id = container.id;
                if (id && !container.hasChildNodes()) {
                    console.log(`Initializing financial spreadsheet: ${id}`);
                    loadSampleFinancialData(id);
                }
            });
        } else {
            console.log('No financial spreadsheet containers found');
            
            // Check if the card container exists for adding a financial model
            const cardContainer = document.getElementById('card-container');
            if (cardContainer && typeof window.addStartupFinancialProject === 'function') {
                console.log('Adding startup financial project to card container');
                window.addStartupFinancialProject(cardContainer);
            }
        }
    }, 500);
});

// Function to load sample financial data into a spreadsheet viewer
function loadSampleFinancialData(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container not found: ${containerId}`);
        return;
    }
    
    console.log(`Loading sample financial data into ${containerId}`);
    
    try {
        // Create a new spreadsheet viewer
        const viewer = new FinancialSpreadsheetViewer(containerId);
        viewer.setTitle('Orlando Tech Startup - Financial Projections');
        
        // Add revenue forecast sheet
        viewer.addSheet({
            name: 'Revenue Forecast',
            description: 'Five-year revenue projection with three product lines and growth analysis.',
            data: [
                ['Revenue Stream', '2024', '2025', '2026', '2027', '2028', 'CAGR'],
                ['SaaS Product', 125000, 312500, 625000, 937500, 1250000, '78%'],
                ['Professional Services', 75000, 187500, 375000, 750000, 1125000, '97%'],
                ['Partnership Revenue', 50000, 125000, 250000, 500000, 750000, '97%'],
                ['Total Revenue', 250000, 625000, 1250000, 2187500, 3125000, '88%'],
                ['YoY Growth', '-', '150%', '100%', '75%', '43%', '-']
            ]
        });
        
        // Add P&L sheet
        viewer.addSheet({
            name: 'P&L Statement',
            description: 'Profit and loss projection showing path to profitability and margin expansion.',
            data: [
                ['Category', '2024', '2025', '2026', '2027', '2028'],
                ['Revenue', 250000, 625000, 1250000, 2187500, 3125000],
                ['COGS', -75000, -156250, -312500, -546875, -781250],
                ['Gross Profit', 175000, 468750, 937500, 1640625, 2343750],
                ['Gross Margin', '70%', '75%', '75%', '75%', '75%'],
                ['Operating Expenses', -225000, -375000, -625000, -1093750, -1406250],
                ['EBITDA', -50000, 93750, 312500, 546875, 937500],
                ['EBITDA Margin', '-20%', '15%', '25%', '25%', '30%'],
                ['Net Income', -65000, 65625, 218750, 382813, 656250],
                ['Net Margin', '-26%', '11%', '18%', '18%', '21%']
            ]
        });
        
        // Add cash flow sheet
        viewer.addSheet({
            name: 'Cash Flow',
            description: 'Cash flow analysis including startup funding and operational sustainability metrics.',
            data: [
                ['Cash Flow', '2024', '2025', '2026', '2027', '2028', 'Total'],
                ['Beginning Balance', 350000, 248750, 345625, 595625, 1120625, 350000],
                ['Cash Inflows', 225000, 593750, 1218750, 2156250, 3109375, 7303125],
                ['Cash Outflows', -326250, -496875, -968750, -1631250, -2296875, -5720000],
                ['Net Cash Flow', -101250, 96875, 250000, 525000, 812500, 1583125],
                ['Ending Balance', 248750, 345625, 595625, 1120625, 1933125, 1933125]
            ]
        });
        
        // Add funding requirements sheet
        viewer.addSheet({
            name: 'Funding Requirements',
            description: 'Investment needs and returns based on growth projections and milestone achievements.',
            data: [
                ['Investment Analysis', 'Amount'],
                ['Seed Investment', 350000],
                ['Series A Target', 1000000],
                ['Total Required Funding', 1350000],
                ['5-Year Cash Position', 1933125],
                ['ROI Multiple (5Y)', '1.43x'],
                ['Breakeven Quarter', 'Q2 2025']
            ]
        });
        
        console.log(`Financial spreadsheet ${containerId} loaded successfully`);
        return viewer;
    } catch (error) {
        console.error(`Error loading financial data for ${containerId}:`, error);
        container.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Failed to load financial data. Please check the console for more details.</p>
            </div>
        `;
        return null;
    }
}

// Expose the function globally
window.loadSampleFinancialData = loadSampleFinancialData;



// ===============================================
// Source: financial-spreadsheet.js
// ===============================================

/**
 * Financial Spreadsheet Showcase
 * Displays multiple sheets from financial models with navigation
 */

class FinancialSpreadsheetViewer {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container with ID '${containerId}' not found`);
            return;
        }
        
        this.options = {
            startingSheet: 0,
            showSheetNames: true,
            showDescription: true,
            ...options
        };
        
        this.currentSheet = this.options.startingSheet;
        this.sheets = [];
        
        this.initializeContainer();
    }
    
    initializeContainer() {
        this.container.classList.add('financial-showcase');
        
        // Create layout elements
        this.createElements();
        
        // Make it responsive
        this.makeResponsive();
    }
    
    createElements() {
        // Main structure
        this.container.innerHTML = `
            <div class="financial-header">
                <div class="financial-title"></div>
                <div class="financial-tabs"></div>
            </div>
            <div class="financial-content">
                <div class="financial-sheet"></div>
                <div class="financial-description"></div>
            </div>
            <div class="financial-navigation">
                <button class="financial-prev" disabled><i class="fas fa-chevron-left"></i> Previous</button>
                <div class="financial-pagination"></div>
                <button class="financial-next" disabled>Next <i class="fas fa-chevron-right"></i></button>
            </div>
        `;
        
        // Cache elements
        this.titleElement = this.container.querySelector('.financial-title');
        this.tabsElement = this.container.querySelector('.financial-tabs');
        this.sheetElement = this.container.querySelector('.financial-sheet');
        this.descriptionElement = this.container.querySelector('.financial-description');
        this.paginationElement = this.container.querySelector('.financial-pagination');
        this.prevButton = this.container.querySelector('.financial-prev');
        this.nextButton = this.container.querySelector('.financial-next');
        
        // Set up event listeners
        this.prevButton.addEventListener('click', () => this.navigateSheet(-1));
        this.nextButton.addEventListener('click', () => this.navigateSheet(1));
    }
    
    setTitle(title) {
        this.titleElement.textContent = title;
    }
    
    addSheet(sheet) {
        this.sheets.push(sheet);
        this.updateControls();
        
        // If this is the first sheet, display it
        if (this.sheets.length === 1) {
            this.displaySheet(0);
        }
        
        // Add tab button if showing sheet names
        if (this.options.showSheetNames) {
            const tabButton = document.createElement('button');
            tabButton.className = 'financial-tab';
            tabButton.textContent = sheet.name;
            tabButton.addEventListener('click', () => this.displaySheet(this.sheets.length - 1));
            this.tabsElement.appendChild(tabButton);
        }
        
        return this;
    }
    
    updateControls() {
        // Update navigation buttons
        this.prevButton.disabled = this.currentSheet <= 0;
        this.nextButton.disabled = this.currentSheet >= this.sheets.length - 1;
        
        // Update pagination
        this.paginationElement.textContent = `${this.currentSheet + 1} / ${this.sheets.length}`;
        
        // Update tabs
        if (this.options.showSheetNames) {
            const tabs = this.tabsElement.querySelectorAll('.financial-tab');
            tabs.forEach((tab, index) => {
                tab.classList.toggle('active', index === this.currentSheet);
            });
        }
    }
    
    displaySheet(index) {
        if (index < 0 || index >= this.sheets.length) return;
        
        this.currentSheet = index;
        const sheet = this.sheets[index];
        
        // Clear previous content
        this.sheetElement.innerHTML = '';
        
        // Create financial table
        const table = this.createTable(sheet.data);
        this.sheetElement.appendChild(table);
        
        // Update description if provided
        if (this.options.showDescription && sheet.description) {
            this.descriptionElement.textContent = sheet.description;
            this.descriptionElement.style.display = 'block';
        } else {
            this.descriptionElement.style.display = 'none';
        }
        
        // Update controls
        this.updateControls();
    }
    
    createTable(data) {
        const table = document.createElement('table');
        table.className = 'financial-table';
        
        // Process headers if first row contains them
        const hasHeaders = Array.isArray(data) && data.length > 0;
        
        if (hasHeaders) {
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            
            // Process the header row
            const headers = data[0];
            headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                headerRow.appendChild(th);
            });
            
            thead.appendChild(headerRow);
            table.appendChild(thead);
            
            // Create table body with data
            const tbody = document.createElement('tbody');
            
            // Start from index 1 to skip the header row
            for (let i = 1; i < data.length; i++) {
                const row = document.createElement('tr');
                
                data[i].forEach((cell, cellIndex) => {
                    const td = document.createElement('td');
                    
                    // Format numbers nicely
                    if (typeof cell === 'number') {
                        // Format as currency if likely to be monetary value
                        if (String(headers[cellIndex]).toLowerCase().includes('revenue') || 
                            String(headers[cellIndex]).toLowerCase().includes('cost') || 
                            String(headers[cellIndex]).toLowerCase().includes('profit') || 
                            String(headers[cellIndex]).toLowerCase().includes('expense') ||
                            String(headers[cellIndex]).toLowerCase().includes('cash') ||
                            String(headers[cellIndex]).toLowerCase().includes('income')) {
                            td.textContent = formatCurrency(cell);
                            td.classList.add('financial-currency');
                        } else {
                            td.textContent = formatNumber(cell);
                        }
                        
                        // Add coloring for positive/negative values
                        if (cell > 0) td.classList.add('financial-positive');
                        if (cell < 0) td.classList.add('financial-negative');
                    } else {
                        td.textContent = cell;
                    }
                    
                    row.appendChild(td);
                });
                
                tbody.appendChild(row);
            }
            
            table.appendChild(tbody);
        }
        
        return table;
    }
    
    navigateSheet(direction) {
        const newIndex = this.currentSheet + direction;
        if (newIndex >= 0 && newIndex < this.sheets.length) {
            this.displaySheet(newIndex);
        }
    }
    
    makeResponsive() {
        // Add responsive class to allow CSS targeting
        this.container.classList.add('financial-responsive');
    }
}

// Helper functions for formatting
function formatNumber(num) {
    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0
    }).format(num);
}

function formatCurrency(num) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(num);
}

// Automatically initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Look for containers with the financial-spreadsheet class
    const containers = document.querySelectorAll('.financial-spreadsheet');
    
    containers.forEach(container => {
        const id = container.id;
        if (!id) return;
        
        // Create demo data if none provided
        if (!container.dataset.initialized) {
            const viewer = new FinancialSpreadsheetViewer(id);
            viewer.setTitle('Startup Financial Model');
            
            // Sample data - replace with your actual data in production
            viewer.addSheet({
                name: 'P&L Statement',
                description: 'Three-year projected profit and loss statement showing revenue growth and profitability trajectory.',
                data: [
                    ['Category', 'Year 1', 'Year 2', 'Year 3'],
                    ['Revenue', 250000, 750000, 1500000],
                    ['COGS', -100000, -275000, -525000],
                    ['Gross Profit', 150000, 475000, 975000],
                    ['Operating Expenses', -200000, -350000, -550000],
                    ['EBITDA', -50000, 125000, 425000],
                    ['Net Income', -65000, 87500, 297500]
                ]
            });
            
            viewer.addSheet({
                name: 'Cash Flow',
                description: 'Cash flow projection including startup capital requirements and operational runway.',
                data: [
                    ['Category', 'Q1', 'Q2', 'Q3', 'Q4', 'Year 1'],
                    ['Beginning Cash', 200000, 152500, 112500, 77500, 200000],
                    ['Cash Inflows', 50000, 60000, 65000, 75000, 250000],
                    ['Cash Outflows', -97500, -100000, -100000, -102500, -400000],
                    ['Net Cash Flow', -47500, -40000, -35000, -27500, -150000],
                    ['Ending Cash', 152500, 112500, 77500, 50000, 50000]
                ]
            });
            
            viewer.addSheet({
                name: 'Balance Sheet',
                description: 'Projected balance sheet showing company\'s financial position and capital structure.',
                data: [
                    ['Category', 'Year 1', 'Year 2', 'Year 3'],
                    ['Assets', 250000, 400000, 800000],
                    ['Liabilities', 115000, 177500, 280000],
                    ['Equity', 135000, 222500, 520000],
                    ['Liabilities + Equity', 250000, 400000, 800000]
                ]
            });
            
            // Mark as initialized
            container.dataset.initialized = 'true';
        }
    });
});

// Expose constructor to window for manual initialization
window.FinancialSpreadsheetViewer = FinancialSpreadsheetViewer;



// ===============================================
// Source: financial-risk-chart.js
// ===============================================

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

