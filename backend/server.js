const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for development - in production, you might want to restrict this
app.use(cors());

// Serve static files from the Frontend directory
app.use(express.static(path.join(__dirname, 'Frontend')));

// Sample API endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Add your other API routes here
// app.get('/api/gold-inr-data', ...);
// app.get('/api/financial-data', ...);

// For SPA routing - serve index.html for any unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'Frontend', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend available at http://localhost:${port}`);
  console.log(`API available at http://localhost:${port}/api`);
});
