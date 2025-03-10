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
