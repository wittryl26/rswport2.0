// Emergency direct chart renderer with no dependencies
console.log("Emergency chart renderer loaded");

(function() {
    // Direct chart rendering with no external dependencies
    window.renderEmergencyChart = function() {
        console.log("EMERGENCY CHART RENDER STARTED");
        
        // Target the specific chart container
        const container = document.getElementById('gold-rupee-chart');
        if (!container) {
            console.error("Gold-Rupee chart container not found!");
            return;
        }
        
        // Style the container very explicitly
        Object.assign(container.style, {
            display: "block", 
            width: "100%",
            height: "400px",
            border: "2px solid red", // Very visible border for debugging
            position: "relative",
            backgroundColor: "#222",
            zIndex: "999",
            overflow: "visible"
        });
        
        // Clear any existing content
        container.innerHTML = '';
        
        // Create a canvas element
        const canvas = document.createElement('canvas');
        Object.assign(canvas.style, {
            display: "block",
            width: "100%",
            height: "100%",
            zIndex: "1000"
        });
        container.appendChild(canvas);
        
        // Basic test data
        const hardcodedData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            gold: [1900, 1950, 2000, 2050, 2100, 2150],
            rupee: [82.5, 83.0, 83.2, 83.7, 84.0, 84.2]
        };
        
        try {
            // Create an absolute minimal chart with no options
            new Chart(canvas, {
                type: 'line',
                data: {
                    labels: hardcodedData.labels,
                    datasets: [
                        {
                            label: 'Gold (USD)',
                            data: hardcodedData.gold,
                            borderColor: 'gold',
                            backgroundColor: 'rgba(255, 215, 0, 0.1)',
                            borderWidth: 2
                        },
                        {
                            label: 'Rupee Rate',
                            data: hardcodedData.rupee,
                            borderColor: 'green',
                            backgroundColor: 'rgba(0, 128, 0, 0.1)',
                            borderWidth: 2
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
            
            console.log("Emergency chart rendered successfully!");
            
            // Add a visible success indicator
            const success = document.createElement('div');
            success.textContent = "CHART RENDERED";
            success.style.cssText = "position:absolute; top:0; right:0; background:green; color:white; padding:5px; z-index:1001";
            container.appendChild(success);
        }
        catch (error) {
            console.error("Chart.js render error:", error);
            
            // Add visible error message
            container.innerHTML = `
                <div style="color:red; padding:20px; border:2px solid red;">
                    <h3>Chart Render Error</h3>
                    <p>${error.message}</p>
                    <pre style="background:#333; padding:10px; overflow:auto; max-height:200px;">${error.stack}</pre>
                </div>
            `;
        }
    };
})();
