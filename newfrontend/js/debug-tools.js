/**
 * Debug Tools
 * Generated merge
 * Merged on: 2025-03-11T00:02:03.118Z
 */


// ===============================================
// Source: debug-control.js
// ===============================================

/**
 * Debug Control - Manages the visibility and functionality of the debug panel
 */

(function() {
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        // Get debug panel if it exists
        const debugPanel = document.getElementById('api-debug');
        
        // Hide debug panel by default
        if (debugPanel) {
            debugPanel.style.display = 'none';
            
            // Store the original position for toggling
            debugPanel.dataset.originalPosition = debugPanel.style.position || 'fixed';
            debugPanel.dataset.originalBottom = debugPanel.style.bottom || '10px';
            debugPanel.dataset.originalRight = debugPanel.style.right || '10px';
        }
        
        // Create a small button to show debug panel if needed
        const showDebugBtn = document.createElement('button');
        showDebugBtn.id = 'show-debug-btn';
        showDebugBtn.innerText = 'Debug';
        showDebugBtn.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(100, 100, 100, 0.5);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 5px 10px;
            font-size: 12px;
            cursor: pointer;
            z-index: 999;
            opacity: 0.6;
        `;
        showDebugBtn.onclick = function() {
            if (debugPanel) {
                debugPanel.style.display = 'block';
                showDebugBtn.style.display = 'none';
            }
        };
        
        // Only add the button in development mode
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            document.body.appendChild(showDebugBtn);
        }
    });
    
    // Global function to toggle debug panel
    window.toggleDebugPanel = function() {
        const debugPanel = document.getElementById('api-debug');
        const showDebugBtn = document.getElementById('show-debug-btn');
        
        if (debugPanel) {
            if (debugPanel.style.display === 'none') {
                debugPanel.style.display = 'block';
                if (showDebugBtn) showDebugBtn.style.display = 'none';
            } else {
                debugPanel.style.display = 'none';
                if (showDebugBtn) showDebugBtn.style.display = 'block';
            }
        }
    };
})();



// ===============================================
// Source: debug-financial-model.js
// ===============================================

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



// ===============================================
// Source: debug-renderer.js
// ===============================================

// Debug helper to visualize container dimensions - DISABLED FOR PRODUCTION
(function() {
    console.log('Debug renderer disabled for production');
    
    // Disabled debug visualization for production
    window.DEBUG_ENABLED = false;
    
    window.addEventListener('DOMContentLoaded', function() {
        // Only run if explicitly enabled
        if (window.DEBUG_ENABLED === true) {
            setTimeout(function() {
                console.log('Running debug renderer');
                
                // Add debug outlines to chart containers
                const charts = document.querySelectorAll('.chart-container');
                charts.forEach((chart, i) => {
                    console.log(`Chart ${i} dimensions:`, {
                        width: chart.offsetWidth,
                        height: chart.offsetHeight,
                        visible: isVisible(chart)
                    });
                    
                    // Add debug overlay - DISABLED
                    // const debugOverlay = document.createElement('div');
                    // debugOverlay.textContent = `Chart: ${chart.id} (${chart.offsetWidth}x${chart.offsetHeight})`;
                    // chart.appendChild(debugOverlay);
                });
            }, 1000);
        }
    });
    
    // Helper function to check if element is visible
    function isVisible(el) {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               el.offsetWidth > 0 && 
               el.offsetHeight > 0;
    }
})();


