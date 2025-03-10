/**
 * HTML Financial Model Display with Tabbed Interface
 * Renders financial tables with tabs for better navigation and space efficiency
 */

// Function to load the financial model data from JSON file
async function loadFinancialModelData() {
  try {
    // Try to load the Redline Exotics financial data
    const response = await fetch('/data/redline-exotics-financial-model.json');
    if (response.ok) {
      return await response.json();
    } else {
      console.warn('Could not load Redline Exotics financial model data, using fallback data');
      return fallbackFinancialModel;
    }
  } catch (error) {
    console.error('Error loading financial model data:', error);
    return fallbackFinancialModel;
  }
}

// Fallback financial model data (in case the JSON file is not available)
const fallbackFinancialModel = {
  "title": "Exotic Car Rental Business - Financial Model",
  "subtitle": "5-Year Financial Projections (2023-2028)",
  "sections": [
    {
      "title": "Income Statement",
      "description": "Detailed income statement projections from 2023 to 2028",
      "headers": ["Category", "2023*", "2024", "2025", "2026", "2027", "2028"],
      "sections": [
        {
          "title": "Revenue & Financing",
          "rows": [
            ["Financial Leverage", "$750,000.00", "$0.00", "$0.00", "$0.00", "$0.00", "$0.00"],
            ["Revenue", "$150,000.00", "$1,147,500.00", "$2,180,250.00", "$2,945,250.00", "$3,748,500.00", "$4,016,250.00"]
          ]
        },
        // Just including key summary rows in the fallback to keep it compact
        {
          "title": "Summary",
          "rows": [
            ["Total OpEx", "$192,877.00", "$221,615.70", "$506,559.02", "$672,533.15", "$900,032.89", "$1,072,483.92"],
            ["Total CapEx", "$587,000.00", "$0.00", "$0.00", "$0.00", "$0.00", "$0.00"],
            ["Total Growth CapEx", "$0.00", "$0.00", "$596,000.00", "$538,000.00", "$580,000.00", "$1,010,000.00"],
            ["Gross Profit", "$120,123.00", "$925,884.30", "$1,077,690.99", "$1,734,716.85", "$2,268,467.11", "$1,933,766.08"],
            ["Net Income", "$105,123.00", "$627,147.64", "$673,954.33", "$1,060,980.19", "$1,324,730.45", "$810,029.39"]
          ]
        }
      ]
    }
  ],
  "notes": [
    "* 2023 figures starting from August 1",
    "This is simplified fallback data. Real data unavailable."
  ]
};

// Fix the tab initialization and navigation issues

// Updated function to render the complete financial model with tabs
async function renderFinancialModel(containerId) {
  console.log(`Rendering financial model in ${containerId}`);
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container not found: ${containerId}`);
    return;
  }

  // Show loading state
  container.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading financial model...</div>';
  
  try {
    // Load the financial model data
    const financialData = await loadFinancialModelData();
    
    // Clear container
    container.innerHTML = '';
    
    // Add model header
    container.innerHTML = `
      <div class="financial-model-header">
        <h2>${financialData.title}</h2>
        ${financialData.subtitle ? `<p>${financialData.subtitle}</p>` : ''}
      </div>
    `;
    
    // Create tabs container
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'financial-tabs';
    container.appendChild(tabsContainer);
    
    // Create tab buttons
    const tabButtons = document.createElement('div');
    tabButtons.className = 'financial-tab-buttons';
    tabsContainer.appendChild(tabButtons);
    
    // Create tab content container
    const tabContent = document.createElement('div');
    tabContent.className = 'financial-tab-content';
    tabsContainer.appendChild(tabContent);
    
    // Create tabs for each section
    financialData.sections.forEach((section, index) => {
      // Create tab button
      const tabButton = document.createElement('button');
      tabButton.className = 'financial-tab-button' + (index === 0 ? ' active' : '');
      tabButton.dataset.tabIndex = index;
      tabButton.textContent = section.title;
      tabButtons.appendChild(tabButton);
      
      // Create tab content pane - FIXED by using unique IDs
      const tabPane = document.createElement('div');
      tabPane.className = 'financial-tab-pane' + (index === 0 ? ' active' : '');
      tabPane.id = `financial-tab-${index}-${containerId}`;
      tabContent.appendChild(tabPane);
      
      // Render the section in the tab
      renderFinancialSectionInTab(section, tabPane.id);
    });
    
    // Add event listeners for tab switching - FIX the selector and tab switching logic
    tabButtons.querySelectorAll('.financial-tab-button').forEach((button, btnIndex) => {
      button.addEventListener('click', () => {
        const tabIndex = parseInt(button.dataset.tabIndex);
        
        // Remove active class from all buttons and panes
        tabButtons.querySelectorAll('.financial-tab-button').forEach(btn => 
          btn.classList.remove('active')
        );
        tabContent.querySelectorAll('.financial-tab-pane').forEach(pane => 
          pane.classList.remove('active')
        );
        
        // Add active class to the clicked button and corresponding pane
        button.classList.add('active');
        tabContent.children[tabIndex].classList.add('active');
        
        // Fix: Use button.textContent instead of section.title
        console.log(`Switched to tab ${tabIndex}: ${button.textContent}`);
      });
    });
    
    // Render notes
    if (financialData.notes) {
      const notesContainer = document.createElement('div');
      notesContainer.className = 'financial-model-notes';
      container.appendChild(notesContainer);
      renderNotes(financialData.notes, notesContainer);
    }
    
    // Make subsections collapsible
    makeSubsectionsCollapsible(container);
    
    console.log('Financial model rendered successfully');
  } catch (error) {
    console.error('Error rendering financial model:', error);
    container.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i> 
        Error rendering financial model. Please check the console for details.
      </div>
    `;
  }
}

// Function to render a section in a tab
function renderFinancialSectionInTab(section, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container not found: ${containerId}`);
    return;
  }

  // Create section header
  const sectionHtml = `
    <div class="financial-table-section">
      ${section.description ? `<p class="table-description">${section.description}</p>` : ''}
      <div class="table-container">
        <table class="financial-table">
          <thead>
            <tr>
              ${section.headers.map(header => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${renderSectionContent(section)}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Append section to container
  container.innerHTML += sectionHtml;
}

// Helper function to render nested section content - update to handle empty cells better
function renderSectionContent(section) {
  let html = '';
  
  // If it has subsections
  if (section.sections) {
    section.sections.forEach(subsection => {
      // Add subsection header
      html += `
        <tr class="subsection-header">
          <td colspan="${section.headers.length}">${subsection.title}</td>
        </tr>
      `;
      
      // Add subsection rows
      subsection.rows.forEach(row => {
        html += `
          <tr class="subsection-content ${isHighlightRow(row[0]) ? 'highlight-row' : ''}">
            ${row.map((cell, index) => `
              <td class="${index === 0 ? 'row-label' : ''} ${isNegativeValue(cell) ? 'negative-value' : ''} ${cell === '-' || cell === '' ? 'empty-cell' : ''}">${cell}</td>
            `).join('')}
          </tr>
        `;
      });
    });
  } else if (section.rows) {
    // Simple section with just rows
    section.rows.forEach(row => {
      html += `
        <tr class="${isHighlightRow(row[0]) ? 'highlight-row' : ''}">
          ${row.map((cell, index) => `
            <td class="${index === 0 ? 'row-label' : ''} ${isNegativeValue(cell) ? 'negative-value' : ''} ${cell === '-' || cell === '' ? 'empty-cell' : ''}">${cell}</td>
          `).join('')}
        </tr>
      `;
    });
  }
  
  return html;
}

// Add collapsible functionality to subsection headers
function makeSubsectionsCollapsible(container) {
  const subsectionHeaders = container.querySelectorAll('.subsection-header');
  
  subsectionHeaders.forEach(header => {
    // Add indicator to show it's collapsible
    const firstCell = header.querySelector('td');
    if (firstCell) {
      firstCell.innerHTML = `<span class="collapse-indicator">▼</span> ${firstCell.innerHTML}`;
    }
    
    header.addEventListener('click', () => {
      header.classList.toggle('collapsed');
      
      // Update the collapse indicator
      const indicator = header.querySelector('.collapse-indicator');
      if (indicator) {
        indicator.textContent = header.classList.contains('collapsed') ? '▶' : '▼';
      }
      
      // Find all rows that are part of this subsection
      let current = header.nextElementSibling;
      while (current && !current.classList.contains('subsection-header')) {
        if (current.classList.contains('subsection-content')) {
          current.classList.toggle('collapsed', header.classList.contains('collapsed'));
        }
        current = current.nextElementSibling;
      }
    });
  });
}

// Helper function to determine if a row should be highlighted
function isHighlightRow(label) {
  const highlightKeywords = ['total', 'margin', 'net income', 'gross profit', 'remaining principal', 'pre-money valuation', 'terminal value'];
  return highlightKeywords.some(keyword => 
    label.toLowerCase().includes(keyword.toLowerCase())
  );
}

// Helper function to determine if a value is negative
function isNegativeValue(value) {
  if (typeof value !== 'string') return false;
  return value.includes('(') || value.startsWith('-');
}

// Function to render notes
function renderNotes(notes, container) {
  if (!container || !notes || notes.length === 0) return;
  
  container.innerHTML = `
    <h4>Notes</h4>
    <ul>
      ${notes.map(note => `<li>${note}</li>`).join('')}
    </ul>
  `;
}

// Add CSS for the financial model
function addFinancialModelStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .financial-model-header {
      margin-bottom: 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 12px;
    }
    
    .financial-table-section {
      margin-bottom: 32px;
    }
    
    .table-description {
      margin-bottom: 12px;
      color: var(--text-secondary, #a0a0a0);
      font-size: 0.9rem;
    }
    
    .table-container {
      overflow-x: auto;
      margin-bottom: 16px;
    }
    
    .financial-table {
      width: 100%;
      border-collapse: collapse;
      font-family: var(--font-code, 'IBM Plex Mono', monospace);
      font-size: 14px;
    }
    
    .financial-table th, .financial-table td {
      padding: 8px;
      text-align: right;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .financial-table th {
      font-weight: 500;
      background-color: rgba(255, 255, 255, 0.05);
    }
    
    .financial-table th:first-child, .financial-table td.row-label {
      text-align: left;
      font-weight: 500;
    }
    
    .financial-table .subsection-header td {
      background-color: rgba(255, 255, 255, 0.08);
      font-weight: 500;
      text-align: left;
      padding: 12px 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      cursor: pointer;
    }
    
    .financial-table .subsection-header .collapse-indicator {
      display: inline-block;
      width: 15px;
      transition: transform 0.3s ease;
      color: var(--accent-primary, #64ffda);
      font-size: 10px;
    }
    
    .financial-table .subsection-header.collapsed .collapse-indicator {
      transform: rotate(-90deg);
    }
    
    .financial-table .subsection-content.collapsed {
      display: none;
    }
    
    .financial-table .highlight-row {
      background-color: rgba(100, 255, 218, 0.05);
      font-weight: 500;
    }
    
    .financial-table .negative-value {
      color: #ff7f7f;
    }
    
    .empty-cell {
      background-color: rgba(0, 0, 0, 0.1);
    }
    
    .financial-model-notes {
      margin-top: 24px;
      padding: 16px;
      background-color: rgba(255, 255, 255, 0.03);
      border-radius: 4px;
    }
    
    .financial-model-notes h4 {
      margin-top: 0;
      margin-bottom: 8px;
    }
    
    .financial-model-notes ul {
      margin: 0;
      padding-left: 20px;
      color: var(--text-secondary, #a0a0a0);
    }
    
    /* Special styling for the valuation table */
    #tab-5 .financial-table {
      max-width: 600px;
      margin: 0 auto;
    }
    
    /* For asset depreciation table - make it more compact */
    #tab-4 .financial-table {
      font-size: 13px;
    }
    
    #tab-4 .financial-table th,
    #tab-4 .financial-table td {
      padding: 6px 4px;
    }
    
    @media (max-width: 768px) {
      .financial-table {
        font-size: 12px;
      }
      
      .financial-table th, .financial-table td {
        padding: 6px 4px;
      }
      
      #tab-4 .financial-table {
        font-size: 11px;
      }
      
      #tab-4 .financial-table th,
      #tab-4 .financial-table td {
        padding: 4px 2px;
      }
    }
    
    @media print {
      .financial-table .highlight-row {
        background-color: #f0f0f0;
        font-weight: 600;
      }
      
      .financial-table .negative-value {
        color: #d32f2f;
      }
      
      .financial-table th {
        background-color: #e0e0e0;
      }
      
      .financial-table .subsection-header td {
        background-color: #eaeaea;
        border-color: #a0a0a0;
      }
      
      .empty-cell {
        background-color: #f9f9f9;
      }
    }
  `;
  document.head.appendChild(style);
}

// Initialize when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Add the financial model styles
  addFinancialModelStyles();
  
  // Check if we're on the financial model page
  const financialContainer = document.getElementById('financial-model-container');
  if (financialContainer) {
    renderFinancialModel('financial-model-container');
  }
  
  // Initialize any other financial model containers
  const modelContainers = document.querySelectorAll('.financial-model-container');
  modelContainers.forEach(container => {
    if (container.id && container.id !== 'financial-model-container') {
      renderFinancialModel(container.id);
    }
  });
});

// Export function for global use
window.renderFinancialModel = renderFinancialModel;
