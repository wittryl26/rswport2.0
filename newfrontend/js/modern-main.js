/**
 * Modern Main JavaScript
 * Core functionality for the portfolio site
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing main functionality");
    
    // Add a class to body after page loads to trigger animations
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);

    // Project data - would typically come from an API
    // Remove the unwanted projects (IoT Data Pipeline, Financial Risk Analysis, Startup Financial Modeling)
    const fallbackProjects = [
        {
            id: 1,
            title: "Economic Analysis & Gold Investment Research",
            description: "Comprehensive analysis examining economic growth trends alongside gold investment performance. This research provides insights into the relationship between economic indicators and gold as a hedge against inflation and market volatility using a case study about India as a demonstration.",
            type: "combined",
            components: [
                {
                    type: "chart",
                    id: "gold-rupee-chart",
                    endpoint: "gold-rupee",
                    title: "Gold Price vs USD/INR Exchange Rate",
                    chartType: "gold-rupee"
                },
                {
                    type: "showcase",
                    id: "gold-showcase",
                    endpoint: "data/gold-research.json", 
                    title: "Gold Investment Analysis",
                    autoplay: false
                }
            ],
            tags: ["Economic Analysis", "Investment Research", "Market Trends", "Asset Allocation"]
        },
        {
            id: 4,
            title: "Project & Time Management",
            description: "Innovative tool that identifies potential project bottlenecks before they impact timelines, using machine learning to analyze historical project data and current workloads. This proactive management approach enables teams to reallocate resources and adjust schedules to prevent delays. Built using open source code, the interface, functionality, and scalability is similar to programs like Slack. The tool is connected to the external program, making it interactive, which I encourage you to explore. ",
            type: "project-management",
            endpoint: "/data/bottleneck-predictor.json",
            containerId: "bottleneck-predictor-container",
            tags: ["Project Management", "Resource Allocation", "Predictive Analytics", "Risk Mitigation"]
        },
        {
            id: 8,
            title: "Strategic Planning & Cost Reduction",
            description: "Built a water reserve quick-fill station solution that doubled the daily amount of water deliverable for vital operations. The project involved analyzing existing infrastructure, identifying inefficiencies, and implementing an innovative system that both improved performance and decreased maintenance requirements.",
            type: "image",
            image: "static/images/water-station.jpg",
            tags: ["Strategic Planning", "Cost Reduction", "Infrastructure", "Resource Management"]
        },
        {
            id: 9,
            title: "Organization & Creativity",
            description: "This portfolio website showcases my technical abilities across various domains. Built with a focus on clean architecture and responsive design, it combines modern front-end techniques with efficient back-end integration. The interactive components demonstrate practical applications of data visualization and user experience design.",
            type: "portfolio-architecture",
            containerId: "portfolio-architecture-container",
            tags: []  // Empty array instead of having specific tags
        }
    ];

    const cardContainer = document.getElementById('card-container');
    if (!cardContainer) {
        console.error("Card container not found!");
        return;
    }

    // Show a loading state
    cardContainer.innerHTML = '<div class="loading-card">Loading projects data...</div>';

    // Flag to track if we've rendered any cards
    let hasRenderedCards = false;

    // Try to get data from API with error handling
    try {
        // Render projects with static data first to ensure content loads
        renderProjects(fallbackProjects);
        hasRenderedCards = true;
        
        // Try to load API data in the background
        initializeApiData()
            .then(apiData => {
                // If we got API data, re-render
                console.log("Data retrieved from API:", apiData);
                renderProjects(apiData);
            })
            .catch(error => {
                console.error("Error getting API data:", error);
                // We already rendered with fallback data, so no need to re-render
                
                // Show warning about using fallback data
                const debugPanel = document.getElementById('api-debug');
                if (debugPanel) {
                    debugPanel.style.display = 'block';
                    const debugContent = document.getElementById('api-debug-content');
                    if (debugContent) {
                        debugContent.innerHTML = 'Using fallback project data. API connection failed.';
                    }
                }
            });
    } catch (error) {
        console.error("Error in main script:", error);
        // If we still don't have cards, render with fallback
        if (!hasRenderedCards) {
            renderProjects(fallbackProjects);
        }
    }

    // Function to get data from APIs with better error handling
    async function initializeApiData() {
        try {
            // Make sure API service is initialized
            const apiService = window.apiService || await initializeApiService();
            
            // Get data from endpoints with timeouts
            const economicData = await Promise.race([
                apiService.getEconomicData(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]);
            
            const financialData = await Promise.race([
                apiService.getFinancialData(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]);
            
            // Return the fallback projects with real data attached
            return fallbackProjects.map(project => {
                // Attach real API data to components
                if (project.type === 'combined') {
                    project.components.forEach(comp => {
                        if (comp.endpoint === 'econ-data') {
                            comp.apiData = economicData;
                        }
                    });
                    return project;
                }
                
                // Attach API data to regular projects
                if (project.endpoint === 'econ-data') {
                    project.apiData = economicData;
                } else if (project.endpoint === 'financial') {
                    project.apiData = financialData;
                }
                return project;
            });
        } catch (error) {
            console.error("Error initializing API data:", error);
            throw error;
        }
    }

    // Render project cards
    function renderProjects(projectsToRender) {
        console.log('Starting project render with:', projectsToRender);
        
        // Clear any loading message
        cardContainer.innerHTML = '';
        
        if (!projectsToRender || projectsToRender.length === 0) {
            cardContainer.innerHTML = '<div class="error-message">No projects available to display</div>';
            return;
        }
        
        console.log(`Rendering ${projectsToRender.length} projects`);
        
        projectsToRender.forEach((project, index) => {
            if (project.type === 'combined') {
                console.log('Rendering combined project:', project.title);
                console.log('Components:', project.components);
            }
            
            const card = document.createElement('article');
            card.className = 'card fade-in';
            card.style.animationDelay = `${index * 0.15}s`;
            card.setAttribute('data-project-id', project.id);

            let contentHTML = '';

            // Special handling for the Strategic Planning project (water station)
            if (project.id === 8 && project.type === 'image') {
                // For this specific project, change the order to put title and description first
                contentHTML = `
                    <div class="card-content">
                        <h3 class="card-title">${project.title}</h3>
                        <p class="card-description">${project.description}</p>
                        
                        <div class="standard-image-container">
                            <img src="${project.image}" alt="${project.title}" class="card-image">
                        </div>
                `;
                
                // Remove any previous custom styling element if it exists
                const oldStyle = document.getElementById('water-station-style');
                if (oldStyle) {
                    oldStyle.remove();
                }
            } else {
                // Standard order for other projects (image first if available)
                if (project.image) {
                    contentHTML += `<img src="${project.image}" alt="${project.title}" class="card-image">`;
                }
                
                contentHTML += `
                    <div class="card-content">
                        <h3 class="card-title">${project.title}</h3>
                        <p class="card-description">${project.description}</p>
                `;
            }
            
            // Handle different project types
            if (project.type === 'combined') {
                contentHTML += '<div class="combined-components">';
                
                // Process each component
                project.components.forEach(component => {
                    if (component.type === 'chart') {
                        contentHTML += `
                            <div class="component">
                                <h4 class="component-title">${component.title}</h4>
                                <div class="chart-container" id="${component.id}" data-chart-type="${component.chartType || 'standard'}"></div>
                            </div>
                        `;
                    } else if (component.type === 'showcase') {
                        contentHTML += `
                            <div class="component">
                                <h4 class="component-title">${component.title}</h4>
                                <div class="showcase-container" id="${component.id}"></div>
                            </div>
                        `;
                    }
                });
                
                contentHTML += '</div>'; // Close combined-components
            } else if (project.type === 'chart') {
                contentHTML += `<div class="chart-container" id="chart-${project.id}"></div>`;
            } else if (project.type === 'showcase') {
                contentHTML += `<div class="showcase-container" id="showcase-${project.id}"></div>`;
            } else if (project.type === 'pdf' && project.hasPdfViewer) {
                contentHTML += `<div class="pdf-viewer-container" id="pdf-viewer-${project.id}"></div>`;
            } else if (project.type === 'pdf') {
                contentHTML += `<iframe src="${project.endpoint}" class="pdf-container"></iframe>`;
            } else if (project.type === 'project-management') {
                contentHTML += `<div id="${project.containerId}" class="bottleneck-predictor-container"></div>`;
            } else if (project.type === 'portfolio-architecture') {
                contentHTML += `<div id="${project.containerId}" class="portfolio-architecture-container"></div>`;
            }
            
            // Add tags
            if (project.tags && project.tags.length > 0) {
                contentHTML += '<div class="card-tags">';
                project.tags.forEach(tag => {
                    contentHTML += `<span class="tag">${tag}</span>`;
                });
                contentHTML += '</div>';
            }
            
            contentHTML += '</div>'; // Close card-content
            card.innerHTML = contentHTML;
            cardContainer.appendChild(card);
            
            // Initialize components AFTER they're in the DOM
            setTimeout(() => {
                if (project.type === 'combined') {
                    project.components.forEach(component => {
                        console.log(`Initializing component: ${component.type} - ${component.id}`);
                        if (component.type === 'chart' && component.chartType === 'gold-rupee') {
                            loadGoldRupeeChart(component.id);
                        } else if (component.type === 'showcase') {
                            initializeShowcase(component.id, component.endpoint);
                        }
                    });
                } else if (project.type === 'project-management') {
                    initializeBottleneckPredictor(project.containerId);
                } else if (project.type === 'portfolio-architecture') {
                    initializePortfolioArchitecture(project.containerId);
                }
            }, 100);
        });
        
        console.log("Project rendering complete");
    }

    // Update scroll indicator functionality
    updateScrollIndicatorFunctionality();
    
    // Fix any black box issues by removing problematic elements
    setTimeout(() => {
        document.querySelectorAll('img[src*="placeholder.jpg"]').forEach(img => {
            if (img.parentNode) {
                console.log('Removing placeholder image that might cause black box issues');
                img.parentNode.removeChild(img);
            }
        });
        
        // Hide the debug panel by default
        const debugPanel = document.getElementById('api-debug');
        if (debugPanel) {
            debugPanel.style.display = 'none';
        }
    }, 500);
});

// Fixed implementation of the Gold-Rupee chart loader
function loadGoldRupeeChart(containerId) {
    const container = document.getElementById(containerId);
    if (!container || container.getAttribute('data-chart-initialized') === 'true') {
        return;
    }

    console.log('Loading gold-rupee chart in', containerId);
    container.setAttribute('data-chart-initialized', 'true');
    
    // Show loading message
    container.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i> Loading gold price data...</div>';
    
    // Use sample data or API data
    if (window.apiService) {
        window.apiService.get('gold-rupee')
            .then(data => {
                createGoldRupeeChart(container, data);
            })
            .catch(error => {
                console.error('Error loading gold-rupee data:', error);
                // Use sample data as fallback
                createGoldRupeeChart(container, getSampleGoldRupeeData());
            });
    } else {
        // Use sample data directly
        createGoldRupeeChart(container, getSampleGoldRupeeData());
    }
}

// Create the gold-rupee chart
function createGoldRupeeChart(container, data) {
    console.log('Creating gold-rupee chart');
    
    // Clear the container
    container.innerHTML = '';
    
    // Create canvas
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    // Format data
    const labels = [];
    const goldValues = [];
    const rupeeValues = [];
    
    if (data && data.data && Array.isArray(data.data)) {
        data.data.forEach(item => {
            if (item.date) {
                const date = new Date(item.date);
                labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            }
            if (item.goldPrice !== undefined) goldValues.push(parseFloat(item.goldPrice));
            if (item.rupeeRate !== undefined) rupeeValues.push(parseFloat(item.rupeeRate));
        });
    }
    
    // Create the chart with Chart.js
    const chart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Gold Price (USD/oz)',
                    data: goldValues,
                    borderColor: '#D4A017', 
                    backgroundColor: 'rgba(212, 160, 23, 0.1)',
                    yAxisID: 'y-gold',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: false
                },
                {
                    label: 'USD/INR Rate',
                    data: rupeeValues,
                    borderColor: '#2E8B57',
                    backgroundColor: 'rgba(46, 139, 87, 0.1)',
                    yAxisID: 'y-rupee',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.3,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Gold Price vs USD/INR Exchange Rate',
                    color: '#ffffff',
                    font: { family: "'IBM Plex Mono', monospace", size: 16 }
                },
                legend: { display: true, position: 'top', labels: { color: '#ffffff' } }
            },
            scales: {
                'y-gold': {
                    position: 'left',
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#D4A017' },
                    title: { display: true, text: 'Gold Price (USD/oz)', color: '#D4A017' }
                },
                'y-rupee': {
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: { color: '#2E8B57' },
                    title: { display: true, text: 'USD/INR Rate', color: '#2E8B57' }
                }
            }
        }
    });
    
    // Store reference to chart instance
    container._chart = chart;
    console.log('Gold-rupee chart created successfully');
}

// Sample data function for gold-rupee chart
function getSampleGoldRupeeData() {
    return {
        title: "Gold Price vs USD/INR Exchange Rate",
        data: [
            { date: '2023-01-01', goldPrice: 1830.25, rupeeRate: 82.74 },
            { date: '2023-02-01', goldPrice: 1859.75, rupeeRate: 82.95 },
            { date: '2023-03-01', goldPrice: 1845.30, rupeeRate: 83.12 },
            { date: '2023-04-01', goldPrice: 1982.10, rupeeRate: 82.53 },
            { date: '2023-05-01', goldPrice: 2035.45, rupeeRate: 82.67 },
            { date: '2023-06-01', goldPrice: 1976.40, rupeeRate: 83.30 },
            { date: '2023-07-01', goldPrice: 1942.15, rupeeRate: 83.14 },
            { date: '2023-08-01', goldPrice: 1994.80, rupeeRate: 83.23 },
            { date: '2023-09-01', goldPrice: 1866.30, rupeeRate: 83.42 },
            { date: '2023-10-01', goldPrice: 1985.60, rupeeRate: 83.36 },
            { date: '2023-11-01', goldPrice: 2043.20, rupeeRate: 83.11 },
            { date: '2023-12-01', goldPrice: 2078.40, rupeeRate: 83.18 }
        ]
    };
}

// Initialize showcase function
function initializeShowcase(containerId, dataUrl, options = {}) {
    console.log(`Initializing showcase: ${containerId} with data from ${dataUrl}`);
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Showcase container not found: ${containerId}`);
        return;
    }
    
    // Show loading state
    container.innerHTML = '<div class="loading-message">Loading showcase data...</div>';
    
    // Fetch the data
    fetch(dataUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Showcase data loaded:', data);
            renderShowcase(container, data, options);
        })
        .catch(error => {
            console.error('Error loading showcase:', error);
            container.innerHTML = '<div class="error-message">Failed to load showcase content</div>';
        });
}

// Render showcase function
function renderShowcase(container, data, options) {
    // Handle both JSON structures
    let title, metadata, slides;
    
    if (data.metadata && data.slides) {
        // New format
        title = data.title;
        metadata = data.metadata;
        slides = data.slides;
    } else if (data.author && data.sections) {
        // Old format
        title = data.title;
        metadata = {
            author: data.author,
            lastUpdated: data.date
        };
        slides = data.sections.map(section => ({
            title: section.heading || section.title,
            content: section.content
        }));
    } else {
        console.error('Unknown showcase data format:', data);
        container.innerHTML = '<div class="error-message">Invalid showcase data format</div>';
        return;
    }
    
    // Create HTML structure
    let html = `
        <div class="horizontal-showcase">
            <div class="showcase-header">
                <div class="showcase-metadata">
                    <span class="showcase-author">${metadata.author}</span>
                    <span class="showcase-date">${metadata.lastUpdated}</span>
                </div>
            </div>
            <div class="showcase-content">
                <div class="showcase-sections-container">
    `;
    
    slides.forEach((slide, index) => {
        html += `
            <div class="showcase-section ${index === 0 ? 'active' : ''}" data-index="${index}">
                <h4 class="showcase-section-title">${slide.title}</h4>
                <div class="showcase-section-content">
                    <p>${slide.content}</p>
                </div>
            </div>
        `;
    });
    
    html += `
                </div>
            </div>
            <div class="showcase-controls">
                <button class="showcase-nav-button prev" disabled>←</button>
                <div class="showcase-indicators">
                    ${slides.map((_, i) => `
                        <button class="showcase-indicator ${i === 0 ? 'active' : ''}" data-index="${i}"></button>
                    `).join('')}
                </div>
                <button class="showcase-nav-button next">→</button>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Initialize navigation
    initializeShowcaseNavigation(container, options);
}

// Add this function to handle showcase navigation
function initializeShowcaseNavigation(container, options) {
    const showcase = container.querySelector('.horizontal-showcase');
    const sections = showcase.querySelectorAll('.showcase-section');
    const prevBtn = showcase.querySelector('.showcase-nav-button.prev');
    const nextBtn = showcase.querySelector('.showcase-nav-button.next');
    const indicators = showcase.querySelectorAll('.showcase-indicator');
    
    let currentIndex = 0;
    
    function showSection(index) {
        sections.forEach(section => section.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        sections[index].classList.add('active');
        indicators[index].classList.add('active');
        
        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === sections.length - 1;
        
        currentIndex = index;
    }
    
    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) showSection(currentIndex - 1);
    });
    
    nextBtn.addEventListener('click', () => {
        if (currentIndex < sections.length - 1) showSection(currentIndex + 1);
    });
    
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => showSection(index));
    });
    
    // Auto-advance if enabled
    if (options.autoplay) {
        const interval = setInterval(() => {
            if (currentIndex < sections.length - 1) {
                showSection(currentIndex + 1);
            } else {
                showSection(0);
            }
        }, options.slideTime || 5000);
        
        // Stop auto-advance on user interaction
        showcase.addEventListener('click', () => clearInterval(interval));
    }
}

// CORRECT IMPLEMENTATION of the bottleneck predictor initialization function
function initializeBottleneckPredictor(containerId) {
    console.log(`Initializing bottleneck predictor in ${containerId}`);
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container not found: ${containerId}`);
        return;
    }
    
    // Show initial loading state
    container.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading project data...</div>';
    
    // Create a wrapper for the complete component (task manager + predictor)
    const wrapper = document.createElement('div');
    wrapper.className = 'bottleneck-management-wrapper';
    container.innerHTML = ''; // Clear the loading indicator
    container.appendChild(wrapper);
    
    // Create a container for the task manager
    const taskContainer = document.createElement('div');
    taskContainer.id = `${containerId}-tasks`;
    taskContainer.className = 'task-manager-container';
    wrapper.appendChild(taskContainer);
    
    // Create a container for the bottleneck predictor
    const predictorContainer = document.createElement('div');
    predictorContainer.id = `${containerId}-predictor`;
    predictorContainer.className = 'bottleneck-predictor-container';
    wrapper.appendChild(predictorContainer);
    
    // Show loading state in predictor container
    predictorContainer.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading project data...</div>';
    
    // Get initial bottleneck data
    const initialData = getSampleBottleneckData();
    
    // Add analytics data
    initialData.analytics = {
        overallRisk: "High",
        recommendedActions: [
            "Reallocate resources from Mobile App Development to CRM Data Migration",
            "Consider adding QA resources to address critical capacity issues"
        ],
        lastRefresh: new Date().toISOString(),
        trendDirection: Math.random() < 0.5 ? 'improving' : 'deteriorating'
    };
    
    // Add metadata
    initialData.meta = {
        lastUpdated: new Date().toISOString(),
        source: "Interactive Task Management System"
    };
    
    console.log("Task container ID:", taskContainer.id);
    console.log("Checking TaskManager availability:", typeof TaskManager);
    
    // Ensure TaskManager is available
    if (typeof TaskManager !== 'function') {
        console.error("TaskManager class not found! Make sure task-management.js is loaded properly.");
        // Display error message
        taskContainer.innerHTML = '<div class="error-message">Task Manager component failed to load.</div>';
    }
    
    try {
        // Initialize the task manager with the initial data
        const taskManager = new TaskManager({
            containerId: taskContainer.id,
            onDataChange: (updatedData) => {
                // When tasks are updated, re-render the bottleneck predictor
                renderBottleneckPredictor(predictorContainer, updatedData);
                updateLastRefreshed(predictorContainer, new Date().toISOString());
            }
        });
        
        // Simulate loading delay
        setTimeout(() => {
            // Initialize the task manager
            console.log("Initializing task manager with data:", initialData);
            taskManager.initialize(initialData);
            
            // Render the initial bottleneck predictor
            renderBottleneckPredictor(predictorContainer, initialData);
            
            // Add last updated indicator
            const refreshElement = document.createElement('div');
            refreshElement.className = 'last-refreshed';
            refreshElement.innerHTML = `
                <small>
                    <i class="fas fa-sync-alt"></i> 
                    Last Updated: ${new Date().toLocaleTimeString()}
                </small>
            `;
            predictorContainer.appendChild(refreshElement);
            
            // Add connection status indicator
            const statusIndicator = document.createElement('div');
            statusIndicator.className = 'connection-status connected';
            statusIndicator.innerHTML = '<span class="status-dot"></span><span class="status-text">Connected to task management system</span>';
            predictorContainer.insertBefore(statusIndicator, predictorContainer.firstChild);
            
            // Save references for future use
            container._taskManager = taskManager;
        }, 1000);
    } catch (error) {
        console.error("Error initializing TaskManager:", error);
        taskContainer.innerHTML = `<div class="error-message">Error initializing task management: ${error.message}</div>`;
    }
}

// Function to update simulated data
function updateSimulatedData(data) {
    // Update project phases with random changes
    data.projects.forEach(project => {
        project.phases.forEach(phase => {
            // Randomly adjust risk levels within reasonable bounds
            phase.risk = Math.min(0.9, Math.max(0.1, phase.risk + (Math.random() * 0.2 - 0.1)));
            
            // Recalculate bottleneck risk based on new risk levels
            if (phase.risk <= 0.3) phase.bottleneckRisk = "Low";
            else if (phase.risk <= 0.6) phase.bottleneckRisk = "Medium";
            else if (phase.risk <= 0.8) phase.bottleneckRisk = "High";
            else phase.bottleneckRisk = "Critical";
        });
    });
    
    // Update resource allocations
    data.resources.forEach(resource => {
        // Randomly adjust allocation ±10%
        resource.allocation = Math.min(1.0, Math.max(0.4, 
            resource.allocation + (Math.random() * 0.2 - 0.1)
        ));
        
        // Recalculate bottleneck risk
        if (resource.allocation <= 0.6) resource.bottleneckRisk = "Low";
        else if (resource.allocation <= 0.75) resource.bottleneckRisk = "Medium";
        else if (resource.allocation <= 0.85) resource.bottleneckRisk = "High";
        else resource.bottleneckRisk = "Critical";
    });
    
    // Update analytics
    data.analytics = {
        overallRisk: calculateOverallRisk(data),
        recommendedActions: getRecommendedActions(data),
        lastRefresh: new Date().toISOString(),
        trendDirection: Math.random() < 0.5 ? 'improving' : 'deteriorating'
    };
    
    data.meta.lastUpdated = new Date().toISOString();
    
    return data;
}

// Helper function to calculate overall risk
function calculateOverallRisk(data) {
    let totalRiskScore = 0;
    let totalItems = 0;
    
    // Calculate from project phases
    data.projects.forEach(project => {
        project.phases.forEach(phase => {
            totalRiskScore += phase.risk;
            totalItems++;
        });
    });
    
    // Calculate from resources
    data.resources.forEach(resource => {
        totalRiskScore += resource.allocation;
        totalItems++;
    });
    
    const avgRisk = totalRiskScore / totalItems;
    
    if (avgRisk <= 0.3) return "Low";
    else if (avgRisk <= 0.6) return "Medium";
    else if (avgRisk <= 0.8) return "High";
    else return "Critical";
}

// Helper function to get recommended actions
function getRecommendedActions(data) {
    const actions = [];
    
    // Look for critical resource allocations
    const criticalResources = data.resources.filter(r => r.bottleneckRisk === "Critical");
    if (criticalResources.length > 0) {
        actions.push(`Reallocate workload from ${criticalResources.map(r => r.name).join(', ')}`);
    }
    
    // Look for critical phase risks
    const criticalPhases = [];
    data.projects.forEach(project => {
        project.phases.forEach(phase => {
            if (phase.bottleneckRisk === "Critical") {
                criticalPhases.push(`${project.name}: ${phase.name}`);
            }
        });
    });
    
    if (criticalPhases.length > 0) {
        actions.push(`Address bottlenecks in ${criticalPhases.join(', ')}`);
    }
    
    // Add general recommendations
    if (actions.length === 0) {
        actions.push("Continue monitoring resource allocation trends");
        actions.push("Review high priority risk factors weekly");
    }
    
    return actions;
}

// Update the connection status indicator
function updateConnectionStatus(indicator, status) {
    if (!indicator) return;
    
    // Remove all status classes
    indicator.classList.remove('connected', 'connecting', 'error', 'disconnected');
    
    // Add current status class
    indicator.classList.add(status.status);
    
    // Update status text
    const statusText = indicator.querySelector('.status-text');
    if (statusText) {
        statusText.textContent = status.message;
    }
}

// Update the last refreshed time
function updateLastRefreshed(container, timestamp) {
    const refreshElement = container.querySelector('.last-refreshed small');
    if (refreshElement) {
        refreshElement.innerHTML = `
            <i class="fas fa-sync-alt"></i> 
            Last Updated: ${new Date(timestamp).toLocaleTimeString()}
        `;
    }
}

// Update the render function to show data source and analytics
function renderBottleneckPredictor(container, data) {
    console.log("Rendering bottleneck predictor with data:", data);
    
    // Clear the container
    container.innerHTML = '';
    
    // Create the HTML structure for the bottleneck predictor
    const predictorEl = document.createElement('div');
    predictorEl.className = 'bottleneck-predictor';
    predictorEl.innerHTML = `
        <div class="predictor-tabs">
            <button class="tab-button active" data-tab="projects">Projects</button>
            <button class="tab-button" data-tab="resources">Resources</button>
            <button class="tab-button" data-tab="risk-matrix">Risk Matrix</button>
        </div>
        
        <div class="predictor-content">
            <div id="projects-tab" class="tab-content active">
                <h4>Project Phase Bottleneck Analysis</h4>
                <div class="projects-grid">
                    ${renderProjectCards(data.projects)}
                </div>
            </div>
            <div id="resources-tab" class="tab-content">
                <h4>Resource Allocation & Bottleneck Risk</h4>
                <div class="resource-chart">
                    ${renderResourceChart(data.resources)}
                </div>
            </div>
            <div id="risk-matrix-tab" class="tab-content">
                <h4>Risk Factor Matrix</h4>
                <div class="risk-matrix">
                    ${renderRiskMatrix(data.riskMatrix)}
                </div>
            </div>
        </div>
    `;
    container.appendChild(predictorEl);
    
    // Add source information if available
    if (data.meta && data.meta.source) {
        const sourceInfo = document.createElement('div');
        sourceInfo.className = 'data-source-info';
        sourceInfo.innerHTML = `<small>Data Source: ${data.meta.source}</small>`;
        container.appendChild(sourceInfo);
    }
    
    // Add event listeners to tabs
    const tabButtons = container.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all tabs
            container.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            container.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            button.classList.add('active');
            container.querySelector(`#${button.dataset.tab}-tab`).classList.add('active');
        });
    });
}

// Sample data for bottleneck predictor
function getSampleBottleneckData() {
    return {
        "projects": [
            {
                "name": "Cloud Migration",
                "phases": [
                    {"name": "Planning", "risk": 0.2, "resources": 3, "duration": 14, "bottleneckRisk": "Low"},
                    {"name": "Development", "risk": 0.7, "resources": 5, "duration": 45, "bottleneckRisk": "High"},
                    {"name": "Testing", "risk": 0.5, "resources": 4, "duration": 21, "bottleneckRisk": "Medium"},
                    {"name": "Deployment", "risk": 0.3, "resources": 6, "duration": 10, "bottleneckRisk": "Low"}
                ],
                "riskFactors": ["Resource availability", "Technical complexity", "Integration dependencies"]
            },
            {
                "name": "CRM Implementation",
                "phases": [
                    {"name": "Requirements", "risk": 0.4, "resources": 4, "duration": 21, "bottleneckRisk": "Medium"},
                    {"name": "Configuration", "risk": 0.6, "resources": 3, "duration": 30, "bottleneckRisk": "High"},
                    {"name": "Data Migration", "risk": 0.8, "resources": 3, "duration": 28, "bottleneckRisk": "Critical"},
                    {"name": "Training", "risk": 0.3, "resources": 2, "duration": 14, "bottleneckRisk": "Low"}
                ],
                "riskFactors": ["Data quality", "Stakeholder availability", "Change management"]
            },
            {
                "name": "Mobile App Development",
                "phases": [
                    {"name": "Design", "risk": 0.3, "resources": 3, "duration": 14, "bottleneckRisk": "Low"},
                    {"name": "Development", "risk": 0.5, "resources": 6, "duration": 42, "bottleneckRisk": "Medium"},
                    {"name": "QA Testing", "risk": 0.6, "resources": 4, "duration": 21, "bottleneckRisk": "High"},
                    {"name": "App Store Approval", "risk": 0.7, "resources": 1, "duration": 14, "bottleneckRisk": "High"}
                ],
                "riskFactors": ["Third-party dependencies", "Technology constraints", "User acceptance"]
            }
        ],
        "resources": [
            {"name": "Frontend Developers", "allocation": 0.85, "bottleneckRisk": "High"},
            {"name": "Backend Developers", "allocation": 0.75, "bottleneckRisk": "Medium"},
            {"name": "QA Engineers", "allocation": 0.9, "bottleneckRisk": "Critical"},
            {"name": "DevOps", "allocation": 0.65, "bottleneckRisk": "Medium"},
            {"name": "Project Managers", "allocation": 0.7, "bottleneckRisk": "Medium"}
        ],
        "riskMatrix": {
            "high": ["QA Testing capacity", "Data migration complexity", "Integration points"],
            "medium": ["Resource availability", "Technical expertise gaps", "Vendor dependencies"],
            "low": ["Budget constraints", "Scope definition", "Stakeholder approval"]
        }
    };
}

// Helper function to render project cards
function renderProjectCards(projects) {
    return projects.map(project => `
        <div class="project-card">
            <h5>${project.name}</h5>
            <div class="project-phases">
                ${project.phases.map(phase => `
                    <div class="phase-bar ${phase.bottleneckRisk.toLowerCase()}">
                        <div class="phase-info">
                            <span class="phase-name">${phase.name}</span>
                            <span class="phase-duration">${phase.duration} days</span>
                        </div>
                        <div class="risk-indicator" title="Bottleneck Risk: ${phase.bottleneckRisk}">
                            ${getBottleneckIcon(phase.bottleneckRisk)}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="risk-factors">
                <small>Risk Factors: ${project.riskFactors.join(', ')}</small>
            </div>
        </div>
    `).join('');
}

// Helper function to render resource chart
function renderResourceChart(resources) {
    return `
        <div class="resource-bars">
            ${resources.map(resource => `
                <div class="resource-item">
                    <div class="resource-label">${resource.name}</div>
                    <div class="resource-bar-container">
                        <div class="resource-bar ${resource.bottleneckRisk.toLowerCase()}" 
                             style="width: ${resource.allocation * 100}%;">
                            ${Math.round(resource.allocation * 100)}%
                        </div>
                    </div>
                    <div class="resource-risk">${getBottleneckIcon(resource.bottleneckRisk)}</div>
                </div>
            `).join('')}
        </div>
        <div class="legend">
            <div class="legend-item"><span class="legend-color low"></span> Low Risk</div>
            <div class="legend-item"><span class="legend-color medium"></span> Medium Risk</div>
            <div class="legend-item"><span class="legend-color high"></span> High Risk</div>
            <div class="legend-item"><span class="legend-color critical"></span> Critical Risk</div>
        </div>
    `;
}

// Helper function to render risk matrix
function renderRiskMatrix(riskMatrix) {
    return `
        <div class="risk-matrix-grid">
            <div class="risk-column high">
                <h6>High Priority</h6>
                <ul>
                    ${riskMatrix.high.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
            <div class="risk-column medium">
                <h6>Medium Priority</h6>
                <ul>
                    ${riskMatrix.medium.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
            <div class="risk-column low">
                <h6>Low Priority</h6>
                <ul>
                    ${riskMatrix.low.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        </div>
        <p class="risk-note">Recommended focus: Address high priority items within 48 hours to prevent project delays.</p>
    `;
}

// Helper function to get bottleneck risk icon
function getBottleneckIcon(risk) {
    const iconMap = {
        'Low': '<i class="fas fa-circle text-success" title="Low Risk"></i>',
        'Medium': '<i class="fas fa-circle text-warning" title="Medium Risk"></i>',
        'High': '<i class="fas fa-circle text-danger" title="High Risk"></i>',
        'Critical': '<i class="fas fa-exclamation-triangle text-danger" title="Critical Risk"></i>'
    };
    
    return iconMap[risk] || '<i class="fas fa-circle" title="Unknown Risk"></i>';
}

// Add styles for bottleneck predictor
function addBottleneckPredictorStyles() {
    if (document.getElementById('bottleneck-predictor-styles')) return;
    
    const styleEl = document.createElement('style');
    styleEl.id = 'bottleneck-predictor-styles';
    styleEl.textContent = `
        .bottleneck-predictor {
            font-family: var(--font-code, 'IBM Plex Mono', monospace);
            background-color: var(--bg-card, #202024);
            border-radius: 8px;
            overflow: hidden;
        }
        
        .predictor-tabs {
            display: flex;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(0, 0, 0, 0.2);
        }
        
        .tab-button {
            background: none;
            border: none;
            padding: 10px 16px;
            color: var(--text-secondary, #a0a0a0);
            cursor: pointer;
            font-family: var(--font-code, 'IBM Plex Mono', monospace);
            font-size: 14px;
            transition: all 0.3s ease;
        }
        
        .tab-button.active {
            color: var(--accent-primary, #64ffda);
            border-bottom: 2px solid var(--accent-primary, #64ffda);
        }
        
        .predictor-content {
            padding: 20px;
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
            animation: fadeIn 0.5s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .projects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 16px;
        }
        
        .project-card {
            background-color: rgba(0, 0, 0, 0.15);
            border-radius: 6px;
            padding: 16px;
        }
        
        .project-card h5 {
            margin-top: 0;
            margin-bottom: 12px;
            font-size: 16px;
        }
        
        .project-phases {
            margin-bottom: 12px;
        }
        
        .phase-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            margin-bottom: 8px;
            border-radius: 4px;
            font-size: 13px;
        }
        
        .phase-bar.low {
            background-color: rgba(46, 204, 113, 0.15);
        }
        
        .phase-bar.medium {
            background-color: rgba(241, 196, 15, 0.15);
        }
        
        .phase-bar.high {
            background-color: rgba(231, 76, 60, 0.15);
        }
        
        .phase-bar.critical {
            background-color: rgba(231, 76, 60, 0.25);
        }
        
        .phase-info {
            display: flex;
            flex-direction: column;
        }
        
        .phase-name {
            font-weight: 500;
        }
        
        .phase-duration {
            font-size: 11px;
            opacity: 0.7;
        }
        
        .risk-indicator {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .text-success { color: #2ecc71; }
        .text-warning { color: #f1c40f; }
        .text-danger { color: #e74c3c; }
        
        .risk-factors {
            font-size: 12px;
            color: var(--text-secondary, #a0a0a0);
        }
        
        .resource-bars {
            margin-top: 16px;
        }
        
        .resource-item {
            display: grid;
            grid-template-columns: 150px 1fr 30px;
            gap: 10px;
            margin-bottom: 12px;
            align-items: center;
        }
        
        .resource-label {
            font-size: 14px;
        }
        
        .resource-bar-container {
            height: 24px;
            background-color: rgba(255, 255, 255, 0.05);
            border-radius: 4px;
            overflow: hidden;
        }
        
        .resource-bar {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 500;
            color: white;
            transition: width 0.5s ease;
        }
        
        .resource-bar.low { background-color: rgba(46, 204, 113, 0.7); }
        .resource-bar.medium { background-color: rgba(241, 196, 15, 0.7); }
        .resource-bar.high { background-color: rgba(231, 76, 60, 0.7); }
        .resource-bar.critical { background-color: rgba(155, 38, 28, 0.7); }
        
        .legend {
            display: flex;
            gap: 15px;
            margin-top: 20px;
            flex-wrap: wrap;
            font-size: 12px;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
        }
        
        .legend-color {
            display: inline-block;
            width: 12px;
            height: 12px;
            margin-right: 5px;
            border-radius: 2px;
        }
        
        .legend-color.low { background-color: rgba(46, 204, 113, 0.7); }
        .legend-color.medium { background-color: rgba(241, 196, 15, 0.7); }
        .legend-color.high { background-color: rgba(231, 76, 60, 0.7); }
        .legend-color.critical { background-color: rgba(155, 38, 28, 0.7); }
        
        .risk-matrix-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-top: 16px;
        }
        
        .risk-column {
            border-radius: 6px;
            padding: 16px;
        }
        
        .risk-column h6 {
            margin-top: 0;
            margin-bottom: 12px;
            text-align: center;
        }
        
        .risk-column.high { background-color: rgba(231, 76, 60, 0.15); }
        .risk-column.medium { background-color: rgba(241, 196, 15, 0.15); }
        .risk-column.low { background-color: rgba(46, 204, 113, 0.15); }
        
        .risk-column ul {
            padding-left: 16px;
            margin-bottom: 0;
        }
        
        .risk-column li {
            margin-bottom: 8px;
            font-size: 13px;
        }
        
        .risk-note {
            margin-top: 16px;
            font-size: 13px;
            color: var(--accent-primary, #64ffda);
            text-align: center;
        }
        
        @media (max-width: 768px) {
            .projects-grid {
                grid-template-columns: 1fr;
            }
            
            .risk-matrix-grid {
                grid-template-columns: 1fr;
            }
            
            .resource-item {
                grid-template-columns: 100px 1fr 20px;
            }
        }
    `;
    
    document.head.appendChild(styleEl);
}

// Update the scroll indicator functionality to work with the new HTML structure
function updateScrollIndicatorFunctionality() {
    const scrollIndicator = document.getElementById('projects-scroll');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const firstCard = document.querySelector('.card');
            if (firstCard) {
                const offset = 100;
                const cardPosition = firstCard.getBoundingClientRect().top;
                const offsetPosition = cardPosition + window.pageYOffset - offset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
}
