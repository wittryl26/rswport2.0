// ...existing code...

function toggleAboutDropdown() {
    const aboutButton = document.querySelector('.about-trigger');
    const dropdown = document.querySelector('.nav-dropdown');
    
    if (!dropdown) {
        // Create dropdown at root level
        const newDropdown = document.createElement('div');
        newDropdown.className = 'nav-dropdown';
        document.body.appendChild(newDropdown);
        
        // Add content
        newDropdown.innerHTML = `
            <div class="dropdown-content">
                // ...existing dropdown content...
            </div>
        `;
        
        // Position relative to button
        const buttonRect = aboutButton.getBoundingClientRect();
        newDropdown.style.top = `${buttonRect.bottom + window.scrollY}px`;
        newDropdown.style.right = '20px';
    } else {
        document.body.removeChild(dropdown);
    }
}

// Update dropdown position on scroll
window.addEventListener('scroll', () => {
    const dropdown = document.querySelector('.nav-dropdown');
    const aboutButton = document.querySelector('.about-trigger');
    
    if (dropdown && aboutButton) {
        const buttonRect = aboutButton.getBoundingClientRect();
        dropdown.style.top = `${buttonRect.bottom + window.scrollY}px`;
    }
});

// ...existing code...
