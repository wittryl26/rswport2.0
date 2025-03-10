/**
 * Create Project Cards
 * Manages the creation of specialized project cards for the portfolio
 */

// Add the Redline Exotics financial project
function addStartupFinancialProject(container) {
    console.log('Adding Redline Exotics financial project to container');
    
    if (!container) {
        console.error('Container is null or undefined');
        return;
    }
    
    // Create project card for financial model
    const card = document.createElement('div');
    card.className = 'card';
    
    // Card content
    card.innerHTML = `
        <div class="card-content">
            <h3 class="card-title">Financial Modeling & Forecasting</h3>
            <p class="card-description">
                Developed a comprehensive financial model for Redline Exotics, a luxury exotic car rental business, 
                including 5-year projections of revenue, expenses, and profitability. The model includes detailed 
                P&L statements, balance sheets, cash flow projections, vehicle depreciation schedules, and venture 
                capital-based valuation. Starting with an initial fleet of four luxury vehicles and expanding to a 
                diverse collection of high-end exotic cars, the business demonstrates strong growth potential with 
                a pre-money valuation of over $22 million by year 5.
            </p>
            <div id="startup-financial-model" class="financial-model-container" style="margin: 20px 0;">
                <div style="display:flex; justify-content:center; align-items:center; height:100px; color:var(--text-secondary);">
                    <i class="fas fa-spinner fa-spin" style="margin-right:10px;"></i> Loading financial model...
                </div>
            </div>
            <div class="card-tags">
                <span class="tag">Luxury Market</span>
                <span class="tag">Financial Modeling</span>
                <span class="tag">Asset Depreciation</span>
                <span class="tag">Venture Valuation</span>
            </div>
        </div>
    `;
    
    // Add card to container
    container.appendChild(card);
    
    // Initialize the financial model after the card is added to the DOM
    setTimeout(() => {
        // Get a reference to the model container
        const modelContainer = document.getElementById('startup-financial-model');
        if (!modelContainer) {
            console.error('startup-financial-model container not found');
            return;
        }
        
        // Render the HTML financial model
        if (typeof renderFinancialModel === 'function') {
            renderFinancialModel('startup-financial-model');
        } else {
            console.error('renderFinancialModel function not found');
            modelContainer.innerHTML = `
                <div style="padding: 1rem; text-align: center; color: var(--text-secondary);">
                    <p>Failed to load financial model. Please check the console for details.</p>
                </div>
            `;
        }
    }, 100);
}

// Auto-initialize when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('create-project-cards.js loaded');
    
    // Check if we need to initialize the financial project
    if (document.querySelector('.financial-model-container') === null) {
        const cardContainer = document.getElementById('card-container');
        if (cardContainer) {
            console.log('Adding startup financial project to main card container');
            // Add a delay to ensure other scripts are loaded
            setTimeout(() => {
                addStartupFinancialProject(cardContainer);
            }, 200);
        }
    }
});
