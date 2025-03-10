/**
 * Portfolio Architecture Component
 * Interactive tree/flowchart visualization of this portfolio website
 */

function initializePortfolioArchitecture(containerId) {
    console.log(`Initializing portfolio architecture in ${containerId}`);
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container not found: ${containerId}`);
        return;
    }
    
    // Show loading state
    container.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading portfolio architecture...</div>';
    
    // Create the architecture data
    const architectureData = {
        name: "Portfolio Website",
        description: "Modern responsive portfolio built with vanilla JavaScript, CSS, and HTML",
        children: [
            {
                name: "Frontend",
                description: "Client-side UI with dynamic components and visualizations",
                iconClass: "fa-desktop",
                children: [
                    {
                        name: "Interactive Components",
                        description: "Dynamic UI elements with real-time interactivity",
                        iconClass: "fa-puzzle-piece",
                        children: [
                            {
                                name: "Bottleneck Predictor",
                                description: "Interactive project management visualization with task management integration",
                                iconClass: "fa-project-diagram",
                                tech: ["JavaScript", "Chart.js", "DOM Manipulation"]
                            },
                            {
                                name: "Financial Model",
                                description: "Interactive financial data exploration with tabs and expandable sections",
                                iconClass: "fa-chart-line",
                                tech: ["JavaScript", "Custom CSS Grid", "Financial Analysis"]
                            },
                            {
                                name: "Gold-Rupee Chart",
                                description: "Dynamic chart showing correlation between gold prices and USD/INR exchange rates",
                                iconClass: "fa-chart-area",
                                tech: ["Chart.js", "FRED API Integration", "Economic Analysis"]
                            }
                        ]
                    },
                    {
                        name: "Responsive Design",
                        description: "Mobile-friendly layout with adaptive components",
                        iconClass: "fa-mobile-alt",
                        tech: ["CSS Grid", "Flexbox", "Media Queries", "CSS Variables"]
                    },
                    {
                        name: "Modern UI",
                        description: "Clean aesthetics with smooth animations and transitions",
                        iconClass: "fa-paint-brush",
                        tech: ["CSS Animations", "Custom Theming", "UI/UX Design"]
                    }
                ]
            },
            {
                name: "Backend",
                description: "Server-side infrastructure with APIs and data management",
                iconClass: "fa-server",
                children: [
                    {
                        name: "Data APIs",
                        description: "Endpoints providing structured data to frontend components",
                        iconClass: "fa-database",
                        tech: ["Express.js", "Node.js", "REST API Design"]
                    },
                    {
                        name: "External Integrations",
                        description: "Connections to third-party data sources and services",
                        iconClass: "fa-plug",
                        children: [
                            {
                                name: "FRED API",
                                description: "Federal Reserve Economic Data for financial charts",
                                iconClass: "fa-university",
                                tech: ["API Authentication", "Data Parsing", "Rate Limiting"]
                            },
                            {
                                name: "Financial Data",
                                description: "Market indices and economic indicators",
                                iconClass: "fa-dollar-sign",
                                tech: ["SQL", "Data Processing", "Financial Modeling"]
                            }
                        ]
                    },
                    {
                        name: "Development Tools",
                        description: "Infrastructure for building and maintaining the site",
                        iconClass: "fa-tools",
                        tech: ["Git", "Cross-Compiling", "Build Scripts", "Deployment Pipelines"]
                    }
                ]
            }
        ]
    };
    
    // Render the architecture visualization
    renderArchitecture(container, architectureData);
}

// Render the architecture tree
function renderArchitecture(container, data) {
    // Clear container
    container.innerHTML = '';
    
    // Create architecture wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'portfolio-architecture';
    
    // Create title and description
    const header = document.createElement('div');
    header.className = 'architecture-header';
    header.innerHTML = `
        <h3>Portfolio Architecture</h3>
        <p class="architecture-description">
            Explore the structure and technologies behind this portfolio website. 
            Click on any node to expand/collapse its details.
        </p>
    `;
    wrapper.appendChild(header);
    
    // Create the tree visualization
    const treeContainer = document.createElement('div');
    treeContainer.className = 'architecture-tree-container';
    
    // Add the root node
    const rootNode = createNode(data, 0);
    treeContainer.appendChild(rootNode);
    
    wrapper.appendChild(treeContainer);
    
    // Add technologies section
    const techSection = document.createElement('div');
    techSection.className = 'architecture-tech-section';
    techSection.innerHTML = `
        <h4>Technologies Used</h4>
        <div class="tech-tags">
            <span class="tech-tag">JavaScript</span>
            <span class="tech-tag">HTML5</span>
            <span class="tech-tag">CSS3</span>
            <span class="tech-tag">Node.js</span>
            <span class="tech-tag">Express</span>
            <span class="tech-tag">Chart.js</span>
            <span class="tech-tag">FRED API</span>
            <span class="tech-tag">Responsive Design</span>
            <span class="tech-tag">Git</span>
            <span class="tech-tag">SQL</span>
            <span class="tech-tag">Python</span>
            <span class="tech-tag">Cross-Compiling</span>
        </div>
    `;
    wrapper.appendChild(techSection);
    
    // Add the wrapper to the container
    container.appendChild(wrapper);
    
    // Add event listeners for expanding/collapsing nodes
    setupNodeInteractions();
}

// Create a tree node
function createNode(nodeData, level) {
    const nodeElement = document.createElement('div');
    nodeElement.className = `architecture-node level-${level}`;
    
    // Create node header (always visible)
    const nodeHeader = document.createElement('div');
    nodeHeader.className = 'node-header';
    
    // Add icon if available
    const iconClass = nodeData.iconClass || 'fa-code';
    
    nodeHeader.innerHTML = `
        <div class="node-icon">
            <i class="fas ${iconClass}"></i>
        </div>
        <div class="node-title">
            <h5>${nodeData.name}</h5>
            <p>${nodeData.description}</p>
        </div>
        ${(nodeData.children || nodeData.tech) ? '<div class="node-toggle"><i class="fas fa-chevron-down"></i></div>' : ''}
    `;
    
    nodeElement.appendChild(nodeHeader);
    
    // Create expandable content if there are children or tech
    if (nodeData.children || nodeData.tech) {
        const nodeContent = document.createElement('div');
        nodeContent.className = 'node-content';
        
        // RESTORE: Add technology tags inside each node
        if (nodeData.tech) {
            const techContainer = document.createElement('div');
            techContainer.className = 'node-tech';
            techContainer.innerHTML = `
                <h6>Technologies:</h6>
                <div class="tech-tags">
                    ${nodeData.tech.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
            `;
            nodeContent.appendChild(techContainer);
        }
        
        // Add children if available
        if (nodeData.children) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'node-children';
            
            // Create child nodes
            nodeData.children.forEach(child => {
                const childNode = createNode(child, level + 1);
                childrenContainer.appendChild(childNode);
            });
            
            nodeContent.appendChild(childrenContainer);
        }
        
        nodeElement.appendChild(nodeContent);
    }
    
    return nodeElement;
}

// Enhance the setupNodeInteractions function to better handle expansion
function setupNodeInteractions() {
    document.querySelectorAll('.node-toggle').forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            // Prevent event propagation to avoid multiple triggers
            e.stopPropagation();
            
            const nodeHeader = this.closest('.node-header');
            const nodeContent = nodeHeader.nextElementSibling;
            const node = this.closest('.architecture-node');
            
            // Toggle expanded class
            node.classList.toggle('expanded');
            
            // Toggle icon
            const icon = this.querySelector('i');
            if (node.classList.contains('expanded')) {
                icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
            } else {
                icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
            }
            
            // If expanding and this is a complex node, ensure enough space
            if (node.classList.contains('expanded') && nodeContent) {
                // Set a high explicit height for large content
                const totalHeight = calculateContentHeight(nodeContent);
                if (totalHeight > 1000) {
                    console.log(`Large node expanded with height: ${totalHeight}`);
                }
            }
        });
        
        // Also make the whole header clickable
        const header = toggle.closest('.node-header');
        header.addEventListener('click', function(e) {
            // Only trigger if the click wasn't on the toggle itself (already handled above)
            if (!e.target.closest('.node-toggle')) {
                this.querySelector('.node-toggle').click();
            }
        });
    });
    
    // Expand the first level by default after a short delay
    setTimeout(() => {
        document.querySelectorAll('.architecture-node.level-0 > .node-header > .node-toggle').forEach(toggle => {
            toggle.click();
        });
    }, 500);
}

// Helper function to calculate content height
function calculateContentHeight(element) {
    // Clone the element to measure its natural height without constraints
    const clone = element.cloneNode(true);
    
    // Apply styles to get an accurate measure
    clone.style.position = 'absolute';
    clone.style.visibility = 'hidden';
    clone.style.maxHeight = 'none';
    clone.style.height = 'auto';
    
    document.body.appendChild(clone);
    const height = clone.offsetHeight;
    document.body.removeChild(clone);
    
    return height;
}
