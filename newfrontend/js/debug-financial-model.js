/**
 * Debug utilities for the financial model
 */

// Function to inspect and log the tab structure
function inspectFinancialModelTabs(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container not found: ${containerId}`);
    return;
  }
  
  console.group('Financial Model Tabs Inspection');
  
  // Check for tabs container
  const tabsContainer = container.querySelector('.financial-tabs');
  console.log('Tabs container:', tabsContainer);
  
  if (tabsContainer) {
    // Check tab buttons
    const buttons = tabsContainer.querySelectorAll('.financial-tab-button');
    console.log(`Found ${buttons.length} tab buttons:`, buttons);
    
    buttons.forEach((btn, index) => {
      console.log(`Button ${index}:`, {
        text: btn.textContent,
        isActive: btn.classList.contains('active'),
        dataset: btn.dataset
      });
    });
    
    // Check tab panes
    const tabContent = tabsContainer.querySelector('.financial-tab-content');
    if (tabContent) {
      const panes = tabContent.querySelectorAll('.financial-tab-pane');
      console.log(`Found ${panes.length} tab panes:`, panes);
      
      panes.forEach((pane, index) => {
        const isActive = pane.classList.contains('active');
        const tables = pane.querySelectorAll('table');
        console.log(`Pane ${index}:`, {
          id: pane.id,
          isActive,
          tablesCount: tables.length,
          isVisible: window.getComputedStyle(pane).display !== 'none',
          content: pane.innerHTML.substring(0, 100) + '...'
        });
      });
    } else {
      console.error('Tab content container not found');
    }
  } else {
    console.error('No tabs container found');
  }
  
  console.groupEnd();
}

// Function to add a debug panel for tab testing
function addFinancialModelDebugPanel(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const debugPanel = document.createElement('div');
  debugPanel.className = 'financial-model-debug';
  debugPanel.style.marginTop = '20px';
  debugPanel.style.padding = '10px';
  debugPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
  debugPanel.style.borderRadius = '4px';
  
  let debugButtons = '';
  
  // Find all tab buttons
  const tabButtons = container.querySelectorAll('.financial-tab-button');
  tabButtons.forEach((btn, index) => {
    debugButtons += `<button data-test-tab="${index}" style="margin:5px;">${btn.textContent}</button>`;
  });
  
  debugPanel.innerHTML = `
    <div style="margin-bottom:10px;">
      <h4 style="margin:0 0 10px 0;">Debug Controls</h4>
      <div>${debugButtons}</div>
      <button id="inspect-tabs-${containerId}" style="margin-top:10px;">Inspect Tabs</button>
    </div>
  `;
  
  container.appendChild(debugPanel);
  
  // Add event listeners for test buttons
  debugPanel.querySelectorAll('button[data-test-tab]').forEach(testBtn => {
    testBtn.addEventListener('click', () => {
      const tabIndex = parseInt(testBtn.dataset.testTab);
      const actualBtn = tabButtons[tabIndex];
      if (actualBtn) {
        console.log(`Manually clicking tab ${tabIndex}`);
        actualBtn.click();
      }
    });
  });
  
  // Add listener for inspection button
  document.getElementById(`inspect-tabs-${containerId}`).addEventListener('click', () => {
    inspectFinancialModelTabs(containerId);
  });
}

// Export functions
window.inspectFinancialModelTabs = inspectFinancialModelTabs;
window.addFinancialModelDebugPanel = addFinancialModelDebugPanel;
