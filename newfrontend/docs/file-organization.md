# Portfolio Website File Organization

## Frontend (/C:/rswportfolio)

Contains all browser-visible content and client-side logic:
- HTML pages
- CSS styles
- Client-side JavaScript
- Static assets (images, PDFs, etc.)

## Backend (/C:/portfolio-fred/fred-api)

Contains server-side code that powers your API:
- Node.js Express server
- API endpoint definitions
- Data handling logic
- Security utilities

## File Organization Map

### Frontend Files (/C:/rswportfolio)

```
rswportfolio/
├── index.html                   # Main entry point/home page
├── resume.html                  # Resume page
├── financial-model-pdf.html     # Financial model page
├── css/                         # All styling files
│   ├── modern-styles.css        # Base styles
│   ├── about-me-dropdown.css    # About me component styles
│   ├── bottleneck-predictor.css # Project bottleneck styles
│   ├── financial-*.css          # Financial model styles
│   ├── portfolio-architecture.css # Architecture styles
│   ├── scroll-indicator.css     # Scroll indicator styles
│   ├── task-management.css      # Task management styles
│   └── *other component styles*
├── js/                          # Client-side JavaScript
│   ├── api-config.js            # API configuration
│   ├── api-service.js           # API connection service
│   ├── modern-main.js           # Main site functionality
│   ├── about-me-dropdown.js     # About me functionality
│   ├── portfolio-architecture.js # Architecture component code
│   └── *other component scripts*
├── static/                      # Static assets
│   ├── images/                  # Image files
│   │   ├── profile-photo.jpg    # Your profile photo
│   │   ├── water-station.jpg    # Project image
│   │   └── *other images*
│   └── docs/                    # Document files
├── data/                        # Static JSON data files
│   ├── bottleneck-predictor.json # Static data for bottleneck
│   ├── gold-research.json       # Gold research data
│   └── *other data files*
├── docs/                        # Documentation
│   ├── content-map.md           # Content text map
│   └── file-organization.md     # This file
└── deploy.js                    # Deployment script
```

### Backend Files (/C:/portfolio-fred/fred-api)

```
fred-api/
├── server.js                    # Main server entry point
├── routes/                      # API route definitions
│   ├── gold-rupee.js            # Gold/Rupee data endpoints
│   └── *other API routes*
├── data/                        # Server-side data
│   ├── bottleneck-predictor-live.json # Live data for bottleneck
│   └── *other data files*
├── utils/                       # Utility functions
│   ├── security.js              # Security utilities
│   ├── port-finder.js           # Port finding utility
│   └── *other utilities*
└── .env                         # Environment variables (not in git)
```
