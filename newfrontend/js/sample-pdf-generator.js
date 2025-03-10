/**
 * Sample PDF Generator
 * Creates a basic financial model PDF if one doesn't exist
 */

// This script uses PDF.js and jsPDF to generate a sample financial model PDF
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sample PDF generator loaded');
    
    // Check if we need to create a sample PDF
    async function checkAndCreateSamplePDF() {
        // Try to find a financial model PDF
        const pdfPaths = [
            'assets/financial-model.pdf',
            'static/docs/financial-model.pdf',
            '/Users/thela/Downloads/Financial Model.pdf'
        ];
        
        let pdfExists = false;
        
        // Check each path
        for (const path of pdfPaths) {
            try {
                const response = await fetch(path, { method: 'HEAD' });
                if (response.ok) {
                    console.log(`Found financial model PDF at ${path}`);
                    pdfExists = true;
                    break;
                }
            } catch (e) {
                console.log(`No PDF found at ${path}`);
            }
        }
        
        // If no PDF found, create a sample one
        if (!pdfExists && typeof jsPDF !== 'undefined') {
            console.log('No financial model PDF found. Creating sample PDF...');
            createSampleFinancialPDF();
        }
    }
    
    // Function to create a sample PDF with financial tables
    function createSampleFinancialPDF() {
        try {
            // Create a new PDF document
            const doc = new jsPDF();
            
            // Add a title
            doc.setFontSize(22);
            doc.text('Financial Model', 105, 20, { align: 'center' });
            doc.setFontSize(16);
            doc.text('Orlando Tech Startup', 105, 30, { align: 'center' });
            
            // Add creation info
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text('Generated sample PDF for demonstration purposes', 105, 38, { align: 'center' });
            doc.setTextColor(0, 0, 0);
            
            // Revenue Forecast page
            doc.setFontSize(18);
            doc.text('Revenue Forecast', 20, 50);
            doc.setFontSize(12);
            doc.text('Five-year revenue projection with three product lines and growth analysis', 20, 58);
            
            // Create a simple table
            const revenueData = [
                ['Revenue Stream', '2024', '2025', '2026', '2027', '2028', 'CAGR'],
                ['SaaS Product', '$125,000', '$312,500', '$625,000', '$937,500', '$1,250,000', '78%'],
                ['Professional Services', '$75,000', '$187,500', '$375,000', '$750,000', '$1,125,000', '97%'],
                ['Partnership Revenue', '$50,000', '$125,000', '$250,000', '$500,000', '$750,000', '97%'],
                ['Total Revenue', '$250,000', '$625,000', '$1,250,000', '$2,187,500', '$3,125,000', '88%'],
                ['YoY Growth', '-', '150%', '100%', '75%', '43%', '-']
            ];
            
            // Draw revenue table
            drawTable(doc, revenueData, 20, 65);
            
            // Add a new page for P&L
            doc.addPage();
            
            // P&L Statement page
            doc.setFontSize(18);
            doc.text('P&L Statement', 20, 20);
            doc.setFontSize(12);
            doc.text('Profit and loss projection showing path to profitability and margin expansion', 20, 28);
            
            // P&L data
            const plData = [
                ['Category', '2024', '2025', '2026', '2027', '2028'],
                ['Revenue', '$250,000', '$625,000', '$1,250,000', '$2,187,500', '$3,125,000'],
                ['COGS', '($75,000)', '($156,250)', '($312,500)', '($546,875)', '($781,250)'],
                ['Gross Profit', '$175,000', '$468,750', '$937,500', '$1,640,625', '$2,343,750'],
                ['Gross Margin', '70%', '75%', '75%', '75%', '75%'],
                ['Operating Expenses', '($225,000)', '($375,000)', '($625,000)', '($1,093,750)', '($1,406,250)'],
                ['EBITDA', '($50,000)', '$93,750', '$312,500', '$546,875', '$937,500'],
                ['EBITDA Margin', '-20%', '15%', '25%', '25%', '30%'],
                ['Net Income', '($65,000)', '$65,625', '$218,750', '$382,813', '$656,250'],
                ['Net Margin', '-26%', '11%', '18%', '18%', '21%']
            ];
            
            // Draw P&L table
            drawTable(doc, plData, 20, 35);
            
            // Add a page for Cash Flow
            doc.addPage();
            
            // Cash Flow page
            doc.setFontSize(18);
            doc.text('Cash Flow', 20, 20);
            doc.setFontSize(12);
            doc.text('Cash flow analysis including startup funding and operational sustainability metrics', 20, 28);
            
            // Cash Flow data
            const cashFlowData = [
                ['Cash Flow', '2024', '2025', '2026', '2027', '2028', 'Total'],
                ['Beginning Balance', '$350,000', '$248,750', '$345,625', '$595,625', '$1,120,625', '$350,000'],
                ['Cash Inflows', '$225,000', '$593,750', '$1,218,750', '$2,156,250', '$3,109,375', '$7,303,125'],
                ['Cash Outflows', '($326,250)', '($496,875)', '($968,750)', '($1,631,250)', '($2,296,875)', '($5,720,000)'],
                ['Net Cash Flow', '($101,250)', '$96,875', '$250,000', '$525,000', '$812,500', '$1,583,125'],
                ['Ending Balance', '$248,750', '$345,625', '$595,625', '$1,120,625', '$1,933,125', '$1,933,125']
            ];
            
            // Draw Cash Flow table
            drawTable(doc, cashFlowData, 20, 35);
            
            // Add a page for Funding Requirements
            doc.addPage();
            
            // Funding Requirements page
            doc.setFontSize(18);
            doc.text('Funding Requirements', 20, 20);
            doc.setFontSize(12);
            doc.text('Investment needs and returns based on growth projections and milestone achievements', 20, 28);
            
            // Funding Requirements data
            const fundingData = [
                ['Investment Analysis', 'Amount'],
                ['Seed Investment', '$350,000'],
                ['Series A Target', '$1,000,000'],
                ['Total Required Funding', '$1,350,000'],
                ['5-Year Cash Position', '$1,933,125'],
                ['ROI Multiple (5Y)', '1.43x'],
                ['Breakeven Quarter', 'Q2 2025']
            ];
            
            // Draw Funding Requirements table
            drawTable(doc, fundingData, 20, 35);
            
            // Save the PDF
            try {
                // First try to save to assets folder if available
                doc.save('assets/financial-model.pdf');
                console.log('Sample PDF saved to assets/financial-model.pdf');
            } catch (e) {
                // If that fails, save locally
                doc.save('financial-model.pdf');
                console.log('Sample PDF saved locally. Please move it to the assets folder.');
                
                // Show a message to the user about the generated PDF
                const message = document.createElement('div');
                message.style.cssText = `
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(100, 255, 218, 0.15);
                    color: #64ffda;
                    padding: 15px 20px;
                    border-radius: 4px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    z-index: 1000;
                    font-family: var(--font-code, 'IBM Plex Mono', monospace);
                    font-size: 14px;
                    max-width: 80%;
                    text-align: center;
                `;
                message.innerHTML = `
                    <div style="margin-bottom: 10px; font-weight: bold;">Sample financial model PDF generated</div>
                    <div>Please move the downloaded file to the assets folder as "financial-model.pdf" for better integration</div>
                    <button id="close-pdf-message" style="margin-top: 10px; background: rgba(100, 255, 218, 0.3); border: none; color: #64ffda; padding: 5px 10px; cursor: pointer; font-family: inherit;">Got it</button>
                `;
                document.body.appendChild(message);
                
                document.getElementById('close-pdf-message').addEventListener('click', function() {
                    message.style.opacity = '0';
                    setTimeout(() => message.remove(), 300);
                });
                
                setTimeout(() => {
                    message.style.opacity = '0';
                    setTimeout(() => message.remove(), 300);
                }, 10000);
            }
            
        } catch (error) {
            console.error('Error generating sample PDF:', error);
        }
    }
    
    // Helper function to draw tables in the PDF
    function drawTable(doc, data, startX, startY) {
        const cellWidth = 25;
        const cellHeight = 8;
        const textMargin = 1;
        
        // Calculate column widths based on content
        const colWidths = new Array(data[0].length).fill(0);
        
        // Determine the maximum width needed for each column
        for (let row = 0; row < data.length; row++) {
            for (let col = 0; col < data[row].length; col++) {
                const cellText = data[row][col] || '';
                const textWidth = doc.getStringUnitWidth(cellText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
                colWidths[col] = Math.max(colWidths[col], textWidth + 6); // Add padding
            }
        }
        
        // Draw header row with background
        doc.setFillColor(220, 220, 220);
        
        let currentX = startX;
        for (let col = 0; col < data[0].length; col++) {
            doc.rect(currentX, startY, colWidths[col], cellHeight, 'FD');
            doc.text(data[0][col], currentX + textMargin, startY + textMargin + 4);
            currentX += colWidths[col];
        }
        
        // Draw data rows
        for (let row = 1; row < data.length; row++) {
            currentX = startX;
            const currentY = startY + (row * cellHeight);
            
            // Alternate row background for readability
            if (row % 2 === 0) {
                doc.setFillColor(240, 240, 240);
                doc.rect(startX, currentY, colWidths.reduce((a, b) => a + b, 0), cellHeight, 'FD');
            }
            
            // Draw cells
            for (let col = 0; col < data[row].length; col++) {
                doc.rect(currentX, currentY, colWidths[col], cellHeight, 'S');
                doc.text(data[row][col], currentX + textMargin, currentY + textMargin + 4);
                currentX += colWidths[col];
            }
        }
    }
    
    // Load jsPDF if needed
    function loadJsPDF() {
        return new Promise((resolve, reject) => {
            if (typeof jsPDF !== 'undefined') {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    // Run check if we're on the financial-model-pdf.html page
    if (window.location.pathname.includes('financial-model') || 
        document.getElementById('pdf-viewer-container')) {
        loadJsPDF()
            .then(checkAndCreateSamplePDF)
            .catch(err => console.error('Error loading jsPDF:', err));
    }
});
