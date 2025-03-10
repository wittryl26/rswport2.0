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
