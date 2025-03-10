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
