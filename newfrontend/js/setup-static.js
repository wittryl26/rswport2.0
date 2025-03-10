const fs = require('fs').promises;
const path = require('path');

async function setupStaticFiles() {
  const staticDir = path.join(__dirname, 'static');
  
  try {
    // Create directories
    await fs.mkdir(path.join(staticDir, 'images'), { recursive: true });
    await fs.mkdir(path.join(staticDir, 'docs'), { recursive: true });
    
    // Create placeholder image if it doesn't exist
    const placeholderPath = path.join(staticDir, 'images', 'placeholder.jpg');
    if (!(await exists(placeholderPath))) {
      await createPlaceholderImage(placeholderPath);
    }
    
    // Create sample PDF if it doesn't exist
    const pdfPath = path.join(staticDir, 'docs', 'architecture.pdf');
    if (!(await exists(pdfPath))) {
      await createSamplePdf(pdfPath);
    }
    
    console.log('Static files setup complete!');
  } catch (error) {
    console.error('Error setting up static files:', error);
  }
}

async function exists(filepath) {
  try {
    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
}

async function createPlaceholderImage(filepath) {
  // Create a minimal base64 encoded 1x1 pixel JPEG
  const base64Image = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
  
  const imageBuffer = Buffer.from(base64Image, 'base64');
  await fs.writeFile(filepath, imageBuffer);
}

async function createSamplePdf(filepath) {
  // Create a minimal PDF file
  const pdfContent = '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n149\n%%EOF\n';
  
  await fs.writeFile(filepath, pdfContent);
}

setupStaticFiles();
