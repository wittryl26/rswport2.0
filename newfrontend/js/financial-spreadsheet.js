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
