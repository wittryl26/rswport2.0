/**
 * About Me Dropdown Functionality
 * Handles toggling the about me dropdown panel
 */

document.addEventListener('DOMContentLoaded', function() {
    const aboutToggle = document.getElementById('about-toggle');
    const aboutDropdown = document.getElementById('about-dropdown');
    
    // If elements don't exist, exit early
    if (!aboutToggle || !aboutDropdown) return;
    
    // Toggle dropdown when clicking the button
    aboutToggle.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event bubbling
        
        aboutToggle.classList.toggle('active');
        aboutDropdown.classList.toggle('active');
        
        // Toggle aria-expanded for accessibility
        const isExpanded = aboutDropdown.classList.contains('active');
        aboutToggle.setAttribute('aria-expanded', isExpanded);
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        // If dropdown is active and click is outside the dropdown
        if (aboutDropdown.classList.contains('active') && 
            !aboutDropdown.contains(e.target) && 
            e.target !== aboutToggle && 
            !aboutToggle.contains(e.target)) {
            
            aboutToggle.classList.remove('active');
            aboutDropdown.classList.remove('active');
            aboutToggle.setAttribute('aria-expanded', false);
        }
    });
    
    // Close dropdown when pressing escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && aboutDropdown.classList.contains('active')) {
            aboutToggle.classList.remove('active');
            aboutDropdown.classList.remove('active');
            aboutToggle.setAttribute('aria-expanded', false);
        }
    });
});
