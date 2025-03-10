/**
 * Horizontal Showcase
 * A clean, minimal horizontal text showcase with smooth transitions
 */

class HorizontalShowcase {
  constructor(containerId, dataUrl, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container element #${containerId} not found`);
      return;
    }

    this.dataUrl = dataUrl;
    this.options = {
      backgroundColor: 'transparent', // No background
      textColor: '#FFFFFF',
      accentColor: '#D4364A',
      slideTime: 12000, // Time in ms to auto-advance slides (12 seconds)
      enableAutoplay: true,
      ...options
    };
    
    console.log(`Initializing ${containerId} with autoplay: ${this.options.enableAutoplay}`);

    this.currentSection = 0;
    this.totalSections = 0;
    this.data = null;
    this.autoplayTimer = null;

    this.initialize();
  }

  async initialize() {
    // Create loading state
    this.container.innerHTML = `
      <div class="showcase-loading">
        <div class="showcase-loading-spinner"></div>
        <div class="showcase-loading-text">Loading research content...</div>
      </div>
    `;

    try {
      // Fetch the data
      const response = await fetch(this.dataUrl);
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
      }
      
      this.data = await response.json();
      this.totalSections = this.data.sections.length;

      // Create showcase structure
      this.createShowcaseStructure();
      
      // Set up event listeners for navigation
      this.setupEventListeners();
      
      // Start autoplay if enabled
      if (this.options.enableAutoplay) {
        this.startAutoplay();
      }

    } catch (error) {
      console.error('Error initializing showcase:', error);
      this.container.innerHTML = `
        <div class="showcase-error">
          <div class="showcase-error-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="showcase-error-text">
            <p>Error loading research content.</p>
            <p class="showcase-error-details">Please ensure your Gold.pdf text has been imported to gold-research.json</p>
            <p class="showcase-error-details">${error.message}</p>
          </div>
        </div>
      `;
    }
  }

  createShowcaseStructure() {
    // Create main container elements with minimal styling
    const { title, author, date, sections } = this.data;
    
    this.container.innerHTML = `
      <div class="horizontal-showcase">
        <div class="showcase-header">
          <div class="showcase-title">${title}</div>
          <div class="showcase-metadata">
            <span class="showcase-author">${author}</span>
            <span class="showcase-date">${date}</span>
          </div>
        </div>
        
        <div class="showcase-content">
          <div class="showcase-sections-container" id="${this.container.id}-sections">
            ${sections.map((section, index) => `
              <div class="showcase-section ${index === 0 ? 'active' : ''}" data-index="${index}">
                <h3 class="showcase-section-title">${section.title}</h3>
                <div class="showcase-section-content">
                  <p>${section.content}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="showcase-controls">
          <button class="showcase-nav-button showcase-prev" id="${this.container.id}-prev">
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <div class="showcase-indicators">
            ${sections.map((_, index) => `
              <button class="showcase-indicator ${index === 0 ? 'active' : ''}" 
                data-index="${index}" aria-label="Go to slide ${index + 1}"></button>
            `).join('')}
          </div>
          
          <button class="showcase-nav-button showcase-next" id="${this.container.id}-next">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    `;
    
    // Get references to DOM elements
    this.sectionsContainer = document.getElementById(`${this.container.id}-sections`);
    this.prevButton = document.getElementById(`${this.container.id}-prev`);
    this.nextButton = document.getElementById(`${this.container.id}-next`);
    this.indicators = this.container.querySelectorAll('.showcase-indicator');
    this.sections = this.container.querySelectorAll('.showcase-section');
    
    // Update button states
    this.updateNavButtons();
    
    // Set initial heights for smoother transitions
    this.updateSectionHeights();
    window.addEventListener('resize', () => this.updateSectionHeights());
  }
  
  // Make sure all sections take the full height for smooth transitions
  updateSectionHeights() {
    const containerHeight = this.sectionsContainer.clientHeight;
    this.sections.forEach(section => {
      section.style.minHeight = `${containerHeight}px`;
    });
  }
  
  setupEventListeners() {
    // Button navigation
    this.prevButton.addEventListener('click', () => this.prevSection());
    this.nextButton.addEventListener('click', () => this.nextSection());
    
    // Indicator navigation
    this.indicators.forEach(indicator => {
      indicator.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.goToSection(index);
      });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      // Only respond to keyboard events if this viewer is in the viewport
      const rect = this.container.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isInViewport) {
        if (e.key === 'ArrowLeft') {
          this.prevSection();
        } else if (e.key === 'ArrowRight') {
          this.nextSection();
        }
      }
    });
    
    // Reset autoplay on user interaction
    const resetAutoplay = () => {
      if (this.options.enableAutoplay) {
        this.stopAutoplay();
        this.startAutoplay();
      }
    };
    
    [this.prevButton, this.nextButton, ...this.indicators].forEach(el => {
      el.addEventListener('click', resetAutoplay);
    });
    
    // Pause autoplay when hovering over the showcase
    this.container.addEventListener('mouseenter', () => this.stopAutoplay());
    this.container.addEventListener('mouseleave', () => {
      if (this.options.enableAutoplay) {
        this.startAutoplay();
      }
    });
  }
  
  startAutoplay() {
    // Don't start autoplay if it's disabled
    if (!this.options.enableAutoplay) {
      console.log('Autoplay disabled for this showcase');
      return;
    }
    
    this.autoplayTimer = setInterval(() => {
      if (this.currentSection < this.totalSections - 1) {
        this.nextSection();
      } else {
        this.goToSection(0); // Loop back to the start
      }
    }, this.options.slideTime);
    
    console.log(`Autoplay started with ${this.options.slideTime}ms interval`);
  }
  
  stopAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }
  
  prevSection() {
    if (this.currentSection > 0) {
      this.goToSection(this.currentSection - 1);
    }
  }
  
  nextSection() {
    if (this.currentSection < this.totalSections - 1) {
      this.goToSection(this.currentSection + 1);
    }
  }
  
  goToSection(index) {
    if (index === this.currentSection) return;
    
    // Hide current section
    this.sections[this.currentSection].classList.remove('active');
    
    // Show new section with fade-in
    this.currentSection = index;
    this.sections[this.currentSection].classList.add('active');
    
    // Update indicators
    this.indicators.forEach((indicator, idx) => {
      indicator.classList.toggle('active', idx === index);
    });
    
    // Update button states
    this.updateNavButtons();
    
    // Scroll to the top of the new section
    this.sections[this.currentSection].scrollTop = 0;
  }
  
  updateNavButtons() {
    if (this.prevButton) this.prevButton.disabled = this.currentSection === 0;
    if (this.nextButton) this.nextButton.disabled = this.currentSection === this.totalSections - 1;
  }
}

// Export the class
window.HorizontalShowcase = HorizontalShowcase;

function initializeShowcase(containerId, dataUrl) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Modify URL if it's relative
    const fullUrl = dataUrl.startsWith('http') ? dataUrl : window.location.origin + dataUrl;
    
    fetch(fullUrl)
        .then(response => response.json())
        .then(data => {
            renderShowcase(container, data);
        })
        .catch(error => {
            console.error('Error loading showcase:', error);
            container.innerHTML = '<div class="error-message">Failed to load content</div>';
        });
}
