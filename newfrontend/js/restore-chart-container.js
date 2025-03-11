/**
 * Very simple script to just restore the chart container element
 * without any initialization logic - letting existing scripts handle that
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Restoring chart container only");
    
    // First check if container already exists
    if (document.getElementById('gold-rupee-chart')) {
        console.log("Chart container already exists");
        return;
    }
    
    // Get projects section
    const projectsSection = document.getElementById('projects');
    if (!projectsSection) {
        console.error("Projects section not found");
        return;
    }
    
    // Create container with EXACT original ID and class
    const chartContainer = document.createElement('div');
    chartContainer.id = 'gold-rupee-chart';
    chartContainer.className = 'chart-container';
    
    // Insert in EXACT original position - directly after projects section heading
    const cardGrid = document.getElementById('card-container');
    if (cardGrid) {
        projectsSection.insertBefore(chartContainer, cardGrid);
        console.log("Chart container restored to original position");
    }
});
