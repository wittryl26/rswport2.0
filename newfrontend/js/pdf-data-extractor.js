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
