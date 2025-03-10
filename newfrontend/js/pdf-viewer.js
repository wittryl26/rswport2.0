/**
 * Stylish PDF Viewer
 * A modern, elegant PDF viewer with slideshow capabilities
 */

class PDFViewer {
  constructor(containerId, pdfUrl, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container element #${containerId} not found`);
      return;
    }

    this.pdfUrl = pdfUrl;
    this.options = {
      backgroundColor: 'rgba(28, 28, 28, 0.7)',
      textColor: '#ffffff',
      accentColor: '#D4364A',
      slideMode: options.slideMode || true,
      startPage: options.startPage || 1,
      ...options
    };

    this.currentPage = this.options.startPage;
    this.totalPages = 0;
    this.pdfDoc = null;
    this.pageRendering = false;
    this.pageNumPending = null;

    this.initialize();
  }

  async initialize() {
    // Create loading state
    this.container.innerHTML = `
      <div class="pdf-loading">
        <div class="pdf-loading-spinner">
          <div class="pdf-loading-bounce"></div>
        </div>
        <div class="pdf-loading-text">Loading research report...</div>
      </div>
    `;

    try {
      // Load PDF.js if it's not already loaded
      if (!window.pdfjsLib) {
        console.log('Loading PDF.js...');
        // We'll use the CDN version for simplicity
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js');
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
      }

      // Load the PDF document
      this.pdfDoc = await window.pdfjsLib.getDocument(this.pdfUrl).promise;
      this.totalPages = this.pdfDoc.numPages;

      // Create viewer structure
      this.createViewerStructure();
      
      // Render the first page
      this.renderPage(this.currentPage);
      
      // Preload adjacent pages for smoother navigation
      this.preloadAdjacentPages();

    } catch (error) {
      console.error('Error initializing PDF viewer:', error);
      this.container.innerHTML = `
        <div class="pdf-error">
          <div class="pdf-error-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="pdf-error-text">
            <p>Error loading the research report.</p>
            <p class="pdf-error-details">${error.message}</p>
          </div>
          <a href="${this.pdfUrl}" target="_blank" class="pdf-error-link">Open PDF directly</a>
        </div>
      `;
    }
  }

  createViewerStructure() {
    // Create main container elements
    this.container.innerHTML = `
      <div class="pdf-viewer" style="background-color: ${this.options.backgroundColor}; color: ${this.options.textColor};">
        <div class="pdf-header">
          <div class="pdf-title">Gold Investment Research Report</div>
          <div class="pdf-pagination">
            <span class="pdf-page-current">${this.currentPage}</span>
            <span class="pdf-page-separator">/</span>
            <span class="pdf-page-total">${this.totalPages}</span>
          </div>
        </div>
        
        <div class="pdf-content">
          <div class="pdf-canvas-container" id="${this.container.id}-canvas-container">
            <!-- Pages will be rendered here -->
          </div>
        </div>
        
        <div class="pdf-controls">
          <button class="pdf-control-button pdf-prev" id="${this.container.id}-prev">
            <i class="fas fa-chevron-left"></i>
          </button>
          <div class="pdf-control-slider-container">
            <input type="range" class="pdf-control-slider" min="1" max="${this.totalPages}" value="${this.currentPage}"
              id="${this.container.id}-slider">
            <div class="pdf-control-progress" style="width: ${(this.currentPage / this.totalPages) * 100}%"></div>
          </div>
          <button class="pdf-control-button pdf-next" id="${this.container.id}-next">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    `;
    
    // Get references to DOM elements
    this.canvasContainer = document.getElementById(`${this.container.id}-canvas-container`);
    this.prevButton = document.getElementById(`${this.container.id}-prev`);
    this.nextButton = document.getElementById(`${this.container.id}-next`);
    this.slider = document.getElementById(`${this.container.id}-slider`);
    
    // Add event listeners
    this.prevButton.addEventListener('click', () => this.previousPage());
    this.nextButton.addEventListener('click', () => this.nextPage());
    this.slider.addEventListener('input', (e) => this.queueRenderPage(parseInt(e.target.value)));
    
    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
      // Only respond to keyboard events if this viewer is in the viewport
      const rect = this.container.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isInViewport) {
        if (e.key === 'ArrowLeft') {
          this.previousPage();
        } else if (e.key === 'ArrowRight') {
          this.nextPage();
        }
      }
    });
  }

  /**
   * Render a specific page
   */
  async renderPage(pageNum) {
    this.pageRendering = true;
    
    // Update UI to show current page
    const currentPageElements = this.container.querySelectorAll('.pdf-page-current');
    currentPageElements.forEach(el => el.textContent = pageNum);
    
    // Update slider position
    if (this.slider) {
      this.slider.value = pageNum;
      const progressBar = this.container.querySelector('.pdf-control-progress');
      if (progressBar) {
        progressBar.style.width = `${(pageNum / this.totalPages) * 100}%`;
      }
    }
    
    // Get the page
    const page = await this.pdfDoc.getPage(pageNum);
    
    // Create a canvas element for this page if it doesn't exist
    let pageContainer = this.canvasContainer.querySelector(`.pdf-page-${pageNum}`);
    if (!pageContainer) {
      pageContainer = document.createElement('div');
      pageContainer.className = `pdf-page pdf-page-${pageNum}`;
      pageContainer.dataset.pageNumber = pageNum;
      
      const canvas = document.createElement('canvas');
      pageContainer.appendChild(canvas);
      this.canvasContainer.appendChild(pageContainer);
      
      // Position pages in a horizontal row for sliding
      if (this.options.slideMode) {
        const pageWidth = this.canvasContainer.clientWidth;
        pageContainer.style.position = 'absolute';
        pageContainer.style.left = `${(pageNum - 1) * 100}%`;
        pageContainer.style.width = '100%';
      }
    }
    
    const canvas = pageContainer.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    
    // Determine the scale to fit the page in the container
    const containerWidth = this.canvasContainer.clientWidth;
    const containerHeight = this.canvasContainer.clientHeight;
    
    const viewport = page.getViewport({ scale: 1 });
    const scale = Math.min(
      containerWidth / viewport.width,
      containerHeight / viewport.height
    ) * 0.95; // 0.95 to add a small margin
    
    const scaledViewport = page.getViewport({ scale });
    
    canvas.height = scaledViewport.height;
    canvas.width = scaledViewport.width;
    
    // Center the canvas
    canvas.style.margin = '0 auto';
    
    // Render the page
    const renderContext = {
      canvasContext: ctx,
      viewport: scaledViewport
    };
    
    const renderTask = page.render(renderContext);
    await renderTask.promise;
    
    // Set current page
    this.currentPage = pageNum;
    
    // Show all pages but slide to the current one
    if (this.options.slideMode) {
      this.canvasContainer.style.transform = `translateX(-${(pageNum - 1) * 100}%)`;
    }
    
    // Update button states
    this.prevButton.disabled = pageNum <= 1;
    this.nextButton.disabled = pageNum >= this.totalPages;
    
    this.pageRendering = false;
    
    // Check if there's a queued page
    if (this.pageNumPending !== null) {
      this.renderPage(this.pageNumPending);
      this.pageNumPending = null;
    }
  }

  /**
   * Queue a page for rendering
   */
  queueRenderPage(pageNum) {
    if (this.pageRendering) {
      this.pageNumPending = pageNum;
    } else {
      this.renderPage(pageNum);
    }
  }

  /** 
   * Go to previous page 
   */
  previousPage() {
    if (this.currentPage <= 1) return;
    this.queueRenderPage(this.currentPage - 1);
  }

  /** 
   * Go to next page 
   */
  nextPage() {
    if (this.currentPage >= this.totalPages) return;
    this.queueRenderPage(this.currentPage + 1);
  }
  
  /**
   * Preload adjacent pages for smoother navigation
   */
  async preloadAdjacentPages() {
    // Preload the next two pages and previous page if they exist
    const pagesToPreload = [
      this.currentPage + 1,
      this.currentPage + 2,
      this.currentPage - 1
    ].filter(p => p > 0 && p <= this.totalPages);
    
    for (let pageNum of pagesToPreload) {
      try {
        const page = await this.pdfDoc.getPage(pageNum);
        // Create placeholder but don't render yet
        let pageContainer = this.canvasContainer.querySelector(`.pdf-page-${pageNum}`);
        if (!pageContainer) {
          pageContainer = document.createElement('div');
          pageContainer.className = `pdf-page pdf-page-${pageNum}`;
          pageContainer.dataset.pageNumber = pageNum;
          
          const canvas = document.createElement('canvas');
          pageContainer.appendChild(canvas);
          this.canvasContainer.appendChild(pageContainer);
          
          if (this.options.slideMode) {
            pageContainer.style.position = 'absolute';
            pageContainer.style.left = `${(pageNum - 1) * 100}%`;
            pageContainer.style.width = '100%';
          }
        }
      } catch (err) {
        console.warn(`Error preloading page ${pageNum}:`, err);
      }
    }
  }
  
  /**
   * Load a script dynamically
   */
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
}

// Export the class
window.PDFViewer = PDFViewer;
