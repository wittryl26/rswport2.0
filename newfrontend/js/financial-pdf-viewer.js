/**
 * Financial PDF Viewer & Data Extractor
 * Displays a PDF in the site's theme and allows extracting data into financial spreadsheets
 */

class FinancialPDFViewer {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container with ID '${containerId}' not found`);
            return;
        }
        
        this.options = {
            pdfUrl: null,
            backgroundColor: 'rgba(22, 22, 22, 0.3)',
            textColor: '#e0e0e0',
            accentColor: '#64ffda',
            borderRadius: '8px',
            ...options
        };
        
        this.currentPage = 1;
        this.totalPages = 0;
        this.pdfDoc = null;
        this.extractedData = [];
        
        this.initializeViewer();
    }
    
    initializeViewer() {
        // Create layout
        this.container.innerHTML = `
            <div class="pdf-financial-container">
                <div class="pdf-financial-header">
                    <div class="pdf-financial-title">Financial Model</div>
                    <div class="pdf-financial-actions">
                        <button class="pdf-financial-btn pdf-extract-btn">Extract Data</button>
                    </div>
                </div>
                <div class="pdf-financial-viewer">
                    <canvas id="${this.container.id}-canvas"></canvas>
                    <div class="pdf-loading">Loading document...</div>
                </div>
                <div class="pdf-financial-controls">
                    <button class="pdf-financial-btn pdf-prev-btn" disabled>
                        <i class="fas fa-chevron-left"></i> Previous
                    </button>
                    <div class="pdf-financial-page-info">Page <span class="pdf-current-page">1</span> of <span class="pdf-total-pages">1</span></div>
                    <button class="pdf-financial-btn pdf-next-btn" disabled>
                        Next <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Add styling
        this.addStyles();
        
        // Cache DOM elements
        this.canvas = document.getElementById(`${this.container.id}-canvas`);
        this.loadingElem = this.container.querySelector('.pdf-loading');
        this.currentPageElem = this.container.querySelector('.pdf-current-page');
        this.totalPagesElem = this.container.querySelector('.pdf-total-pages');
        this.prevBtn = this.container.querySelector('.pdf-prev-btn');
        this.nextBtn = this.container.querySelector('.pdf-next-btn');
        this.extractBtn = this.container.querySelector('.pdf-extract-btn');
        this.titleElem = this.container.querySelector('.pdf-financial-title');
        
        // Set up event listeners
        this.prevBtn.addEventListener('click', () => this.prevPage());
        this.nextBtn.addEventListener('click', () => this.nextPage());
        this.extractBtn.addEventListener('click', () => this.extractSheetData());
        
        // If PDF URL is provided, load it
        if (this.options.pdfUrl) {
            this.loadDocument(this.options.pdfUrl);
        }
        
        // If title is provided, set it
        if (this.options.title) {
            this.titleElem.textContent = this.options.title;
        }
    }
    
    addStyles() {
        // Create stylesheet
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            .pdf-financial-container {
                display: flex;
                flex-direction: column;
                height: 100%;
                width: 100%;
                background-color: ${this.options.backgroundColor};
                border-radius: ${this.options.borderRadius};
                color: ${this.options.textColor};
                font-family: var(--font-code, 'IBM Plex Mono', monospace);
                overflow: hidden;
            }
            
            .pdf-financial-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .pdf-financial-title {
                font-size: 1.2rem;
                color: ${this.options.accentColor};
                font-weight: 400;
            }
            
            .pdf-financial-viewer {
                flex: 1;
                overflow: auto;
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
                background-color: rgba(0, 0, 0, 0.3);
            }
            
            .pdf-loading {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: ${this.options.textColor};
            }
            
            .pdf-financial-controls {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .pdf-financial-page-info {
                color: ${this.options.textColor};
                font-size: 0.9rem;
            }
            
            .pdf-financial-btn {
                background: transparent;
                border: 1px solid ${this.options.accentColor};
                color: ${this.options.accentColor};
                padding: 0.5rem 1rem;
                cursor: pointer;
                font-family: var(--font-code, 'IBM Plex Mono', monospace);
                font-size: 0.9rem;
                border-radius: 4px;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
            }
            
            .pdf-financial-btn:hover:not(:disabled) {
                background: rgba(100, 255, 218, 0.1);
                transform: translateY(-2px);
            }
            
            .pdf-financial-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none;
            }
            
            .pdf-financial-btn i {
                font-size: 0.8rem;
                margin: 0 0.3rem;
            }
            
            .pdf-extract-btn {
                background-color: rgba(100, 255, 218, 0.1);
            }
        `;
        document.head.appendChild(styleEl);
    }
    
    async loadDocument(source) {
        // Show loading
        this.loadingElem.style.display = 'block';
        
        try {
            // Make sure PDF.js is loaded
            if (!window.pdfDataExtractor) {
                console.error('PDF Data Extractor not found. Make sure to include pdf-data-extractor.js');
                return;
            }
            
            // Load PDF
            this.pdfDoc = await window.pdfDataExtractor.loadPDF(source);
            this.totalPages = this.pdfDoc.numPages;
            
            // Update UI
            this.totalPagesElem.textContent = this.totalPages;
            this.updateButtonState();
            
            // Render the first page
            this.renderPage(1);
        } catch (error) {
            console.error('Error loading document:', error);
            this.loadingElem.textContent = 'Failed to load document.';
        }
    }
    
    async renderPage(pageNumber) {
        this.loadingElem.style.display = 'block';
        
        try {
            // Get page
            const page = await this.pdfDoc.getPage(pageNumber);
            
            // Get viewport
            const viewport = page.getViewport({ scale: 1.5 });
            
            // Set canvas dimensions
            this.canvas.height = viewport.height;
            this.canvas.width = viewport.width;
            
            // Render the page
            const renderContext = {
                canvasContext: this.canvas.getContext('2d'),
                viewport: viewport
            };
            
            await page.render(renderContext).promise;
            
            // Update current page
            this.currentPage = pageNumber;
            this.currentPageElem.textContent = pageNumber;
            this.updateButtonState();
            
            // Hide loading
            this.loadingElem.style.display = 'none';
        } catch (error) {
            console.error('Error rendering page:', error);
            this.loadingElem.textContent = 'Failed to render page.';
        }
    }
    
    updateButtonState() {
        this.prevBtn.disabled = this.currentPage <= 1;
        this.nextBtn.disabled = this.currentPage >= this.totalPages;
    }
    
    prevPage() {
        if (this.currentPage > 1) {
            this.renderPage(this.currentPage - 1);
        }
    }
    
    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.renderPage(this.currentPage + 1);
        }
    }
    
    async extractSheetData() {
        // Show extraction is happening
        this.extractBtn.disabled = true;
        this.extractBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Extracting...';
        
        try {
            // Extract data from current page
            const pageData = await window.pdfDataExtractor.extractTableData(this.pdfDoc, this.currentPage);
            
            // Store extracted data
            this.extractedData = pageData;
            
            // Create an event to notify any listeners that data has been extracted
            const event = new CustomEvent('financial-data-extracted', { 
                detail: { 
                    pageNumber: this.currentPage,
                    data: pageData 
                } 
            });
            this.container.dispatchEvent(event);
            
            // Prompt user that data has been extracted
            this.extractBtn.innerHTML = '<i class="fas fa-check"></i> Data Extracted';
            
            // Reset after a delay
            setTimeout(() => {
                this.extractBtn.disabled = false;
                this.extractBtn.innerHTML = 'Extract Data';
            }, 2000);
            
            return pageData;
        } catch (error) {
            console.error('Error extracting data:', error);
            this.extractBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Failed';
            
            // Reset after a delay
            setTimeout(() => {
                this.extractBtn.disabled = false;
                this.extractBtn.innerHTML = 'Extract Data';
            }, 2000);
            
            return null;
        }
    }
    
    // Export extracted data to a financial spreadsheet
    exportToFinancialSpreadsheet(containerId, sheetName, description) {
        if (!this.extractedData || this.extractedData.length === 0) {
            console.error('No data has been extracted yet');
            return;
        }
        
        // Create financial spreadsheet
        const viewer = new FinancialSpreadsheetViewer(containerId);
        viewer.setTitle('Extracted Financial Model');
        
        viewer.addSheet({
            name: sheetName || `Page ${this.currentPage}`,
            description: description || `Data extracted from page ${this.currentPage}`,
            data: this.extractedData
        });
        
        return viewer;
    }
}

// Expose to window
window.FinancialPDFViewer = FinancialPDFViewer;
