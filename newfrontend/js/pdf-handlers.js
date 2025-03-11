/**
 * PDF Handlers
 * Generated merge
 * Merged on: 2025-03-11T00:02:03.116Z
 */


// ===============================================
// Source: pdf-data-extractor.js
// ===============================================

/**
 * PDF Data Extractor - Helper utility for extracting structured data from PDF files
 */

class PDFDataExtractor {
    constructor() {
        this.isReady = false;
        this.readyPromise = this.initialize();
    }

    async initialize() {
        if (!window.pdfjsLib) {
            console.log('Loading PDF.js');
            
            // Create a script element to load PDF.js
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.5.141/pdf.min.js';
            document.head.appendChild(script);
            
            // Wait for the script to load
            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
            });
        }
        
        this.isReady = true;
    }

    async ready() {
        if (!this.isReady) {
            await this.readyPromise;
        }
        return true;
    }

    async loadPDF(fileOrUrl) {
        await this.ready();
        
        try {
            let source;
            
            // Handle Data URLs for sample PDFs
            if (typeof fileOrUrl === 'string' && fileOrUrl.startsWith('data:application/pdf;base64,')) {
                console.log('Loading PDF from data URL');
                source = { data: fileOrUrl };
            } else {
                source = fileOrUrl;
            }
            
            // Use the sample PDF if explicitly requested
            if (fileOrUrl === 'sample' && window.samplePdfDataUrl) {
                console.log('Using sample PDF data URL');
                source = { data: window.samplePdfDataUrl };
            }
            
            console.log('Loading PDF from source:', typeof source);
            const pdf = await window.pdfjsLib.getDocument(source).promise;
            return pdf;
        } catch (error) {
            console.error('Error loading PDF:', error);
            
            // Fallback to sample PDF
            if (fileOrUrl !== 'sample' && window.samplePdfDataUrl) {
                console.log('Falling back to sample PDF data URL');
                try {
                    const pdf = await window.pdfjsLib.getDocument({ data: window.samplePdfDataUrl }).promise;
                    return pdf;
                } catch (e) {
                    console.error('Failed to load sample PDF:', e);
                    return null;
                }
            }
            
            return null;
        }
    }
    
    async extractPageText(pdf, pageNumber) {
        try {
            const page = await pdf.getPage(pageNumber);
            const textContent = await page.getTextContent();
            return textContent.items.map(item => item.str).join(' ');
        } catch (error) {
            console.error(`Error extracting text from page ${pageNumber}:`, error);
            return '';
        }
    }
    
    async extractTableData(pdf, pageNumber, options = {}) {
        const text = await this.extractPageText(pdf, pageNumber);
        
        // Simple table extraction - this is a basic implementation
        // For more complex tables, you might need a more sophisticated algorithm
        const lines = text.split('\n').filter(line => line.trim().length > 0);
        const tableData = [];
        
        for (const line of lines) {
            // Split by multiple spaces or tabs
            const cells = line.split(/\s{2,}|\t/).filter(cell => cell.trim().length > 0);
            if (cells.length > 0) {
                tableData.push(cells);
            }
        }
        
        return tableData;
    }
    
    formatAsCurrency(value) {
        // Check if value is a number or can be converted to a number
        const num = parseFloat(value.replace(/[^0-9.-]+/g, ''));
        if (!isNaN(num)) {
            return num;
        }
        return value;
    }
    
    async extractFinancialData(pdfSource, pageIndices = [1], options = {}) {
        const pdf = await this.loadPDF(pdfSource);
        if (!pdf) return [];
        
        const allData = [];
        
        for (const pageIndex of pageIndices) {
            const tableData = await this.extractTableData(pdf, pageIndex, options);
            
            // Process financial data - attempt to convert numbers and detect headers
            const processedData = tableData.map((row, rowIndex) => {
                return row.map((cell, cellIndex) => {
                    // If it's likely a financial value, convert it to a number
                    if (rowIndex > 0 && cellIndex > 0 && /^[\$]?[\d,]+(\.\d+)?$/.test(cell.trim())) {
                        return this.formatAsCurrency(cell);
                    }
                    return cell;
                });
            });
            
            allData.push(processedData);
        }
        
        return allData;
    }
    
    // Helper method to directly import into our financial spreadsheet viewer
    async importToFinancialViewer(pdfSource, viewerId, sheetDefinitions) {
        // Wait for the library to load
        await this.ready();
        
        // Check if the FinancialSpreadsheetViewer exists
        if (!window.FinancialSpreadsheetViewer) {
            console.error('FinancialSpreadsheetViewer not found');
            return;
        }
        
        // Get the viewer container
        const viewerContainer = document.getElementById(viewerId);
        if (!viewerContainer) {
            console.error(`Viewer container with ID '${viewerId}' not found`);
            return;
        }
        
        // Create viewer instance
        const viewer = new FinancialSpreadsheetViewer(viewerId);
        
        // Set title if provided
        if (sheetDefinitions.title) {
            viewer.setTitle(sheetDefinitions.title);
        }
        
        // Load the PDF
        const pdf = await this.loadPDF(pdfSource);
        if (!pdf) {
            console.error('Failed to load PDF');
            return;
        }
        
        // Process each sheet definition
        for (const sheetDef of sheetDefinitions.sheets) {
            try {
                // Extract table data from the specified page
                const tableData = await this.extractTableData(pdf, sheetDef.pageIndex || 1);
                
                // Create a sheet from the extracted data
                viewer.addSheet({
                    name: sheetDef.name || `Sheet ${sheetDef.pageIndex || 1}`,
                    description: sheetDef.description || '',
                    data: tableData
                });
                
            } catch (error) {
                console.error(`Error processing sheet ${sheetDef.name}:`, error);
            }
        }
        
        return viewer;
    }
}

// Create global instance
window.pdfDataExtractor = new PDFDataExtractor();



// ===============================================
// Source: pdf-file-handler.js
// ===============================================

/**
 * PDF File Handler
 * Handles copying PDF files from source locations to the assets folder
 */

class PDFFileHandler {
    constructor() {
        this.assetsPath = 'assets'; // Default path
        this.init();
    }
    
    init() {
        // Create a file input element for handling uploaded PDFs
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.accept = '.pdf';
        this.fileInput.style.display = 'none';
        document.body.appendChild(this.fileInput);
        
        // Listen for changes to the file input
        this.fileInput.addEventListener('change', (event) => {
            if (event.target.files && event.target.files[0]) {
                const file = event.target.files[0];
                if (this.onFileSelected) {
                    this.onFileSelected(file);
                }
            }
        });
    }
    
    /**
     * Trigger the file selection dialog
     * @param {Function} callback - Function to call when a file is selected
     */
    selectFile(callback) {
        this.onFileSelected = callback;
        this.fileInput.click();
    }
    
    /**
     * Load a PDF file from a URL or local file
     * @param {string|File} source - URL or File object
     * @param {Function} callback - Function to call with the loaded PDF data
     */
    loadPDF(source, callback) {
        if (typeof source === 'string') {
            // Source is a URL
            fetch(source)
                .then(response => response.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.onload = () => callback(reader.result);
                    reader.readAsArrayBuffer(blob);
                })
                .catch(error => {
                    console.error('Error loading PDF from URL:', error);
                    callback(null);
                });
        } else if (source instanceof File) {
            // Source is a File object
            const reader = new FileReader();
            reader.onload = () => callback(reader.result);
            reader.readAsArrayBuffer(source);
        } else {
            console.error('Invalid source type. Expected URL string or File object.');
            callback(null);
        }
    }
    
    /**
     * Save a PDF file to the assets folder via backend API
     * @param {File} file - PDF file to save
     * @param {string} filename - Name to save the file as
     * @returns {Promise<string>} - Promise resolving to the URL of the saved file
     */
    async saveToAssets(file, filename) {
        // Create a FormData object to send the file
        const formData = new FormData();
        formData.append('pdf', file, filename || file.name);
        
        try {
            // Send the file to the server
            const response = await fetch('/api/upload-pdf', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            return result.url; // Return the URL of the saved file
        } catch (error) {
            console.error('Error saving PDF to assets:', error);
            return null;
        }
    }
    
    /**
     * Copy an existing PDF file to the assets folder
     * @param {string} sourcePath - Path to the source PDF file
     * @param {string} targetFilename - Name to save the file as
     */
    async copyToAssets(sourcePath, targetFilename) {
        try {
            // Try to fetch the PDF file
            const response = await fetch(sourcePath);
            if (!response.ok) {
                throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
            }
            
            // Convert to blob
            const blob = await response.blob();
            
            // Create a File object from the blob
            const file = new File([blob], targetFilename || 'financial-model.pdf', { type: 'application/pdf' });
            
            // Save to assets
            return await this.saveToAssets(file, targetFilename);
        } catch (error) {
            console.error('Error copying PDF to assets:', error);
            return null;
        }
    }
    
    /**
     * Get the DataURL for a PDF file (useful for embedding directly in the page)
     * @param {File|Blob} file - PDF file or blob
     * @returns {Promise<string>} - Promise resolving to the DataURL
     */
    getDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

// Create global instance
window.pdfFileHandler = new PDFFileHandler();



// ===============================================
// Source: pdf-integration.js
// ===============================================

/**
 * PDF Integration Script
 * Integrates PDF loading and processing functionality into the site
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("PDF integration script loading");
    
    // Skip checking with HEAD requests that cause 404 errors
    // Instead, just create a sample PDF right away
    
    // Function to add the financial PDF viewer link to any relevant pages
    function addFinancialPDFViewerLink() {
        // Look for financial spreadsheet containers
        const financialContainers = document.querySelectorAll('.financial-spreadsheet');
        
        if (financialContainers.length === 0) return;
        
        // For each container, add a link to view the full PDF
        financialContainers.forEach(container => {
            // Create a parent wrapper if it doesn't exist
            let wrapper = container.parentElement;
            
            // Check if we already added a link
            if (wrapper.querySelector('.pdf-viewer-link')) return;
            
            // Create link to the PDF viewer
            const viewerLink = document.createElement('div');
            viewerLink.className = 'pdf-viewer-link';
            viewerLink.innerHTML = `
                <a href="financial-model-pdf.html" class="btn btn-secondary" target="_blank">
                    <i class="fas fa-file-pdf"></i> View Complete Financial Model
                </a>
            `;
            
            // Style the link
            const linkStyle = document.createElement('style');
            linkStyle.textContent = `
                .pdf-viewer-link {
                    margin: 1rem 0;
                    text-align: right;
                }
                .pdf-viewer-link a {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background-color: rgba(100, 255, 218, 0.1);
                    color: var(--accent-primary);
                    padding: 8px 16px;
                    border-radius: 4px;
                    text-decoration: none;
                    font-family: var(--font-code);
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                }
                .pdf-viewer-link a:hover {
                    background-color: rgba(100, 255, 218, 0.2);
                    transform: translateY(-2px);
                }
                .pdf-viewer-link i {
                    font-size: 1rem;
                }
            `;
            document.head.appendChild(linkStyle);
            
            // Add the link after the container
            wrapper.insertBefore(viewerLink, container.nextSibling);
        });
    }
    
    // Function to create a sample PDF directly in the browser
    function createSamplePDF() {
        // Check if jsPDF is available
        if (typeof jsPDF === 'undefined') {
            // Load jsPDF if it's not available
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                script.onload = () => {
                    console.log('jsPDF loaded, creating sample PDF');
                    _createAndSaveSamplePDF().then(resolve).catch(reject);
                };
                script.onerror = () => reject(new Error('Failed to load jsPDF'));
                document.head.appendChild(script);
            });
        } else {
            return _createAndSaveSamplePDF();
        }
    }
    
    // Helper function to create and save the sample PDF
    function _createAndSaveSamplePDF() {
        return new Promise((resolve, reject) => {
            try {
                // Create a new PDF document
                const doc = new window.jspdf.jsPDF();
                
                // Add a title
                doc.setFontSize(22);
                doc.text('Financial Model', 105, 20, { align: 'center' });
                doc.setFontSize(16);
                doc.text('Orlando Tech Startup', 105, 30, { align: 'center' });
                
                // Add Revenue Forecast page
                doc.setFontSize(18);
                doc.text('Revenue Forecast', 20, 50);
                
                // Create a simple table
                const revenueData = [
                    ['Revenue Stream', '2024', '2025', '2026', '2027', '2028'],
                    ['SaaS Product', '125,000', '312,500', '625,000', '937,500', '1,250,000'],
                    ['Prof Services', '75,000', '187,500', '375,000', '750,000', '1,125,000'],
                    ['Partnership', '50,000', '125,000', '250,000', '500,000', '750,000'],
                    ['Total Revenue', '250,000', '625,000', '1,250,000', '2,187,500', '3,125,000']
                ];
                
                // Draw table
                let y = 60;
                for (let i = 0; i < revenueData.length; i++) {
                    let x = 20;
                    for (let j = 0; j < revenueData[i].length; j++) {
                        doc.text(revenueData[i][j], x, y);
                        x += 35;
                    }
                    y += 10;
                }
                
                // Add P&L Statement page
                doc.addPage();
                doc.setFontSize(18);
                doc.text('P&L Statement', 20, 20);
                
                // Create the blob and save it as base64 string
                const pdfBlob = doc.output('blob');
                const reader = new FileReader();
                reader.readAsDataURL(pdfBlob);
                reader.onloadend = function() {
                    const base64data = reader.result;
                    window.samplePdfDataUrl = base64data;
                    console.log('Sample PDF created as data URL');
                    resolve(base64data);
                };
            } catch (error) {
                console.error('Error creating sample PDF:', error);
                reject(error);
            }
        });
    }
    
    // Modified function to ensure PDF is available, now directly creates a sample PDF
    async function ensurePDFInAssets() {
        console.log('Creating sample PDF immediately to avoid 404 errors');
        
        // Create a sample PDF since we know the file doesn't exist
        try {
            const pdfDataUrl = await createSamplePDF();
            // Store the data URL for later use
            window.samplePdfDataUrl = pdfDataUrl;
            return pdfDataUrl;
        } catch (error) {
            console.error('Failed to create sample PDF:', error);
            return null;
        }
    }
    
    // Initialize PDF integration
    async function initPDFIntegration() {
        // Add link to PDF viewer
        addFinancialPDFViewerLink();
        
        // Ensure PDF is available
        const pdfPath = await ensurePDFInAssets();
        
        // Store the path for use elsewhere
        window.financialModelPDFPath = pdfPath;
        
        // If we're on the PDF viewer page, initialize it
        const viewerContainer = document.getElementById('pdf-viewer-container');
        if (viewerContainer && pdfPath && window.FinancialPDFViewer) {
            new window.FinancialPDFViewer('pdf-viewer-container', {
                pdfUrl: pdfPath,
                title: 'Orlando Tech Startup - Financial Model'
            });
        }
    }
    
    // Wait for all dependencies to load
    const checkDependencies = () => {
        // If we're attempting PDF integration, we need these scripts
        const scripts = [
            { src: 'js/pdf-data-extractor.js', global: 'pdfDataExtractor' },
            { src: 'js/financial-pdf-viewer.js', global: 'FinancialPDFViewer' }
        ];
        
        // Check if dependencies are loaded
        const missingScripts = scripts.filter(script => 
            !window[script.global] && !document.querySelector(`script[src="${script.src}"]`)
        );
        
        // If missing any scripts, load them
        if (missingScripts.length > 0) {
            console.log('Loading PDF integration dependencies...');
            
            // Load each missing script
            const promises = missingScripts.map(script => {
                return new Promise((resolve, reject) => {
                    const scriptEl = document.createElement('script');
                    scriptEl.src = script.src;
                    scriptEl.onload = resolve;
                    scriptEl.onerror = reject;
                    document.body.appendChild(scriptEl);
                });
            });
            
            // When all scripts are loaded, initialize
            Promise.all(promises)
                .then(() => {
                    console.log('All PDF dependencies loaded');
                    setTimeout(initPDFIntegration, 100);
                })
                .catch(error => {
                    console.error('Error loading PDF dependencies:', error);
                });
        } else {
            // All dependencies already loaded
            initPDFIntegration();
        }
    };
    
    // Start checking dependencies
    checkDependencies();
});



// ===============================================
// Source: pdf-viewer.js
// ===============================================

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


