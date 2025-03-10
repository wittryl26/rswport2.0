# Portfolio Content Map

This document serves as a master control for all editable text content across the portfolio website.

## Main Page (index.html)

### Header & Navigation
- **Contact Info**: Located in `.top-nav` - Email, phone, location
  - File: `/C:/rswportfolio/index.html`
  - Current values: "rylandscottwittman@gmail.com", "(847) 714-3013", "Florida"

### Hero Section
- **Name**: `<h1>` in `.hero-content`
  - File: `/C:/rswportfolio/index.html`
  - Current value: "Ryland Wittman"
- **Subtitle**: `.subtitle` in `.hero-content`
  - Current value: "Professional Portfolio"
- **Main Description**: `.main-description` in `.hero-content`
  - Current value: "Please explore my work featuring financial modeling, data analysis, and technology expertise for luxury automotive and financial markets."
- **Resume Button**: `.button-text` in `.hero-buttons`
  - Current value: "View Resume"

### Project Cards
All project data is managed in the JavaScript array `fallbackProjects` in the modern-main.js file:

- **File**: `/C:/rswportfolio/js/modern-main.js`

Key editable fields for each project:
1. **title**: Project headline
2. **description**: Detailed project description
3. **tags**: Array of skill/technology tags
4. **image**: Path to project image (for image type projects)
5. **components**: For combined-type projects, contains titles and other text elements

### Footer
- **Footer Links**: Located in `.footer-links` section
  - File: `/C:/rswportfolio/index.html`
  - Current values: "Home", "Projects", "Resume"
- **Copyright**: Text in `<p>` within `<footer>`
  - Current value: "© 2025 Ryland Wittman. All rights reserved."

## Project Content

### 1. Economic Analysis & Gold Investment Research
- **File**: `/C:/rswportfolio/js/modern-main.js`
- **Title**: "Economic Analysis & Gold Investment Research"
- **Description**: "Comprehensive analysis examining economic growth trends alongside gold investment performance. This research provides insights into the relationship between economic indicators and gold as a hedge against inflation and market volatility using a case study about India as a demonstration. Included is a chart visualization powered by a custom Node.js API I built from scratch that fetches live gold price data and USD/INR exchange rates. The data is processed through a serverless function using Express for routing and Chart.js for visualization, demonstrating full-stack development skills."
- **Chart Title**: "Gold Price vs USD/INR Exchange Rate"
- **Showcase Title**: "Gold Investment Analysis"
- **Tags**: ["Economic Analysis", "Investment Research", "Market Trends", "Asset Allocation"]

### 2. Project Bottleneck Predictor
- **File**: `/C:/rswportfolio/js/modern-main.js`
- **Title**: "Project Bottleneck Predictor"
- **Description**: "Innovative tool that identifies potential project bottlenecks before they impact timelines, using machine learning to analyze historical project data and current workloads. This proactive management approach enables teams to reallocate resources and adjust schedules to prevent delays, improving on-time delivery rates by 37% in pilot implementations."
- **Tags**: ["Project Management", "Resource Allocation", "Predictive Analytics", "Risk Mitigation"]

### 3. Strategic Planning & Cost Reduction
- **File**: `/C:/rswportfolio/js/modern-main.js`
- **Title**: "Strategic Planning & Cost Reduction"
- **Description**: "Developed a water reserve quick-fill station solution that reduced operational costs by 32% while increasing emergency preparedness capabilities. The project involved analyzing existing infrastructure, identifying inefficiencies, and implementing an innovative system that both improved performance and decreased maintenance requirements."
- **Image**: "static/images/water-station.jpg"
- **Tags**: ["Strategic Planning", "Cost Reduction", "Infrastructure", "Resource Management"]

### 4. Organization & Creativity (Portfolio Architecture)
- **File**: `/C:/rswportfolio/js/modern-main.js`
- **Title**: "Organization & Creativity"
- **Description**: "This portfolio website showcases my technical abilities across various domains. Built with a focus on clean architecture and responsive design, it combines modern front-end techniques with efficient back-end integration. The interactive components demonstrate practical applications of data visualization and user experience design."
- **Tags**: [] (empty array)

## Portfolio Architecture Component

- **File**: `/C:/rswportfolio/js/portfolio-architecture.js`
- **Section Title**: "Portfolio Architecture"
- **Description**: "Explore the structure and technologies behind this portfolio website. Click on any node to expand/collapse its details."
- **Technologies Section Title**: "Technologies Used"
- **Technology Tags**: "JavaScript", "HTML5", "CSS3", "Node.js", "Express", "Chart.js", "FRED API", "Responsive Design", "Git", "SQL", "Python", "Cross-Compiling"

The architecture nodes also contain editable text:
- Node titles (e.g., "Frontend", "Backend")
- Node descriptions
- Technology tags for specific nodes

## Financial Model

- **File**: `/C:/rswportfolio/financial-model-pdf.html`
- **Page Title**: "Redline Exotics Financial Model"
- **Main Heading**: "Redline Exotics Financial Model"
- **Card Title**: "Luxury Exotic Car Rental Business"
- **Card Description**: "The following financial model demonstrates the business plan and growth strategy for Redline Exotics, a high-end exotic car rental company. Use the tabs below to navigate between financial statements including Income Statement, Balance Sheet, Cash Flow Statement, Financial Ratios, Asset Depreciation Schedule and Valuation. Each section can be expanded or collapsed for easier review."
- **Tags**: ["Luxury Industry", "Fleet Management", "Revenue Forecasting", "Growth Strategy"]

## Bottleneck Predictor Data

- **File**: `/C:/rswportfolio/data/bottleneck-predictor.json`
- Contains editable text for project names, phase names, risk factors, and resource names

## Resume Page

- **File**: `/C:/rswportfolio/resume.html` (if exists)
- Contains all resume content - education, experience, skills, etc.
- Check for any hardcoded resume data in JavaScript files as well

## API and Server Configuration

- **File**: `/C:/rswportfolio/backend/server.js`
- Contains configuration for API endpoints and data paths
- Sample data can be edited for financial, economic, and gold-rupee data

## Tips for Editing Content

1. **Project Cards**: To modify project information, edit the `fallbackProjects` array in `/C:/rswportfolio/js/modern-main.js`
2. **Contact Info**: Update email, phone, and location in the top navigation section of `/C:/rswportfolio/index.html`
3. **Portfolio Architecture**: Modify node titles, descriptions, and tech tags in `/C:/rswportfolio/js/portfolio-architecture.js`
4. **Financial Model**: Edit financial data in `/C:/rswportfolio/data/redline-exotics-financial-model.json`
5. **Bottleneck Data**: Modify project management data in `/C:/rswportfolio/data/bottleneck-predictor.json`
