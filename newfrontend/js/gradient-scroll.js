document.addEventListener('DOMContentLoaded', function() {
    const gradient = document.querySelector('.gradient-bg');
    const homeSection = document.querySelector('#home');
    
    if (!gradient || !homeSection) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateGradient(scrollY) {
        const homeSectionBottom = homeSection.offsetTop + homeSection.offsetHeight;
        const scrollProgress = Math.min(1, Math.max(0, scrollY / homeSectionBottom));
        
        // Calculate a smooth parallax effect
        const offset = Math.min(scrollY * 0.3, 100); // Limit the maximum offset
        gradient.style.setProperty('--scroll-offset', `${offset}px`);
        
        // Adjust opacity based on scroll position
        const opacity = Math.max(0, 1 - (scrollProgress * 1.5));
        gradient.style.opacity = opacity;
    }

    window.addEventListener('scroll', function() {
        lastScrollY = window.scrollY;
        
        if (!ticking) {
            window.requestAnimationFrame(function() {
                updateGradient(lastScrollY);
                ticking = false;
            });
            
            ticking = true;
        }
    });
});
