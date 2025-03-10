// script.js

// Expertise card data
const expertiseData = [
    {
        image: "workflow-app-screenshot.jpg",
        title: "Operational Efficiency",
        description: "Built a web app to streamline workflows for myself and contributors.",
        label: "Workflow App: Efficiency Tool"
    },
    {
        image: "debt-graph.jpg",
        title: "Business Development",
        description: "Developed strategies to support startup growth and financing.",
        label: "Debt Financing: Startup Strategy"
    },
    {
        image: "market-analysis.pdf",
        title: "Market Analysis",
        description: "Authored a 2024 market analysis with actionable insights.",
        label: "Market Analysis: 2024 Report"
    },
    {
        image: "financial-chart.jpg",
        title: "Technical Analysis",
        description: "Live financial algorithm for strategic insights.",
        label: "Live Chart: Technical Analysis"
    },
    {
        image: "fred-labor-dashboard.jpg",
        title: "Technical Proficiency",
        description: "Real-Time Labor Market Pulse for Smarter Hiring.",
        label: "FRED Labor Pulse: Hiring Insights"
    },
    {
        image: "asana-dashboard.jpg",
        title: "Project Coordination",
        description: "Project Bottleneck Predictor for Proactive Management.",
        label: "Asana Predictor: Real-Time Risks"
    }
];

// Function to create expertise card
function createExpertiseCard(data) {
    const card = document.createElement('div');
    card.className = 'expertise-card';

    let contentElement = '';
    if (data.image.endsWith('.pdf')) {
        contentElement = `<iframe src="${data.image}" width="100%" height="300px" style="border:none;"></iframe>`;
    } else if (data.image.includes('fred')) {
        contentElement = `<canvas class="fred-chart" data-title="${data.title}" style="width: 100%; height: 300px;"></canvas>`;
    } else if (data.image.includes('asana')) {
        contentElement = `<canvas id="asanaChart" data-title="${data.title}" style="width: 100%; height: 300px;"></canvas>`;
    } else if (data.image.includes('financial')) {
        contentElement = `<div class="api-placeholder" data-type="${data.title.toLowerCase().replace(' ', '-')}" style="width: 100%; height: 300px; background-color: #333333; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #FFFFFF;">Loading Financial Chart...</div>`;
    } else {
        contentElement = `<img src="${data.image}" alt="${data.title}" style="max-height: 300px; object-fit: cover;">`;
    }

    card.innerHTML = `
        ${contentElement}
        <h3 style="color: #FFFFFF; font-family: 'IBM Plex Mono', monospace;">${data.title}</h3>
        <p style="color: #CCCCCC; font-family: 'IBM Plex Mono', monospace;">${data.description}</p>
        <p class="label" style="color: #2e0000; font-family: 'IBM Plex Mono', monospace; background-color: #FFFFFF; padding: 2px 8px; border-radius: 4px;">${data.label}</p>
    `;

    return card;
}

// Load initial expertise cards
const expertiseContainer = document.querySelector('.expertise-container');
expertiseData.forEach(data => {
    const card = createExpertiseCard(data);
    expertiseContainer.appendChild(card);
});

// Infinite Scroll
let currentIndex = 0;
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && currentIndex < expertiseData.length) {
            const card = createExpertiseCard(expertiseData[currentIndex]);
            expertiseContainer.appendChild(card);
            currentIndex++;
            observer.observe(card);
        }
    });
}, { threshold: 0.1 });

if (expertiseContainer.lastElementChild) {
    observer.observe(expertiseContainer.lastElementChild);
}

// Economic Data Integration for Technical Proficiency
let econDataLoaded = false;

async function fetchEconData() {
    const proxyUrl = 'http://localhost:3000/econ-data';
    try {
        const response = await fetch(proxyUrl, { timeout: 5000 });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log('Economic Data:', data);
        // Separate BLS and FRED data
        const blsData = data.filter(d => d.source === 'BLS').map(d => ({
            date: new Date(d.date),
            value: d.value
        }));
        const fredData = data.filter(d => d.source === 'FRED').map(d => ({
            date: new Date(d.date),
            value: d.value
        }));
        return { bls: blsData.slice(-12), fred: fredData.slice(-12) }; // Last 12 months
    } catch (error) {
        console.error('Error fetching economic data:', error);
        return { bls: [], fred: [] };
    }
}

async function initializeEconChart() {
    if (econDataLoaded) return;
    const charts = document.querySelectorAll('.fred-chart');
    for (const chart of charts) {
        const title = chart.dataset.title;
        if (title === 'Technical Proficiency') {
            try {
                const { bls, fred } = await fetchEconData();
                if (bls.length === 0 && fred.length === 0) throw new Error('No valid economic data');
                const labels = bls.length > 0 ? bls.map(d => d.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })).filter((_, i) => i % 3 === 0) : 
                               fred.map(d => d.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })).filter((_, i) => i % 3 === 0);
                const datasets = [];
                if (bls.length > 0) {
                    datasets.push({
                        label: 'BLS Unemployment Rate (%)',
                        data: bls.map(d => d.value).filter((_, i) => i % 3 === 0),
                        borderColor: 'rgba(255, 99, 132, 1)',
                        fill: false,
                        tension: 0.1
                    });
                }
                if (fred.length > 0) {
                    datasets.push({
                        label: 'FRED Job Openings (Thousands)',
                        data: fred.map(d => d.value).filter((_, i) => i % 3 === 0),
                        borderColor: 'rgba(54, 162, 235, 1)',
                        fill: false,
                        tension: 0.1
                    });
                }

                new Chart(chart, {
                    type: 'line',
                    data: { labels, datasets },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: { title: { display: true, text: 'Date', color: '#FFFFFF' }, ticks: { color: '#FFFFFF', font: { family: 'IBM Plex Mono', size: 12 } } },
                            y: { title: { display: true, text: 'Value', color: '#FFFFFF' }, ticks: { color: '#FFFFFF', font: { family: 'IBM Plex Mono', size: 12 } } }
                        },
                        plugins: {
                            legend: { position: 'top', labels: { color: '#FFFFFF', font: { family: 'IBM Plex Mono', size: 14 } } },
                            title: { display: true, text: 'Real-Time Labor Market Pulse', color: '#FFFFFF', font: { family: 'IBM Plex Mono', size: 18 } }
                        }
                    }
                });
                econDataLoaded = true;
            } catch (error) {
                console.error('Error initializing econ chart:', error);
                chart.textContent = 'Error loading economic chart';
            }
        }
    }
}

// Asana API Integration for Project Coordination
async function fetchAsanaData() {
    const personalAccessToken = process.env.ASANA_PERSONAL_ACCESS_TOKEN || '2/1209548931200102/1209548874521120:687fb930c5d22a1d5fef00dda023f079';
    const projectId = process.env.ASANA_PROJECT_ID || '1209548870918139';
    const url = `https://app.asana.com/api/1.0/projects/${projectId}/tasks?opt_fields=name,due_at,completed,status&limit=50`;
    try {
        const response = await fetch(url, { headers: { 'Authorization': `Bearer ${personalAccessToken}` } });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log('Asana API Response:', data);
        return data.data || [];
    } catch (error) {
        console.error('Error fetching Asana data:', error);
        return [];
    }
}

function calculateBottleneckRisk(tasks) {
    const overdueTasks = tasks.filter(task => {
        if (!task.due_at) return false;
        const dueDate = new Date(task.due_at);
        const isCompleted = task.completed === false || !task.completed;
        const isOverdue = dueDate < new Date() && isCompleted;
        return isOverdue;
    }).length;
    const totalTasks = tasks.length || 1;
    const riskScore = (overdueTasks / totalTasks) * 100 || 0;
    return { overdue: overdueTasks, total: totalTasks, risk: riskScore.toFixed(1) };
}

function updateAsanaDashboard(tasks) {
    const ctx = document.getElementById('asanaChart').getContext('2d');
    const bottleneck = calculateBottleneckRisk(tasks);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Overdue Tasks', 'Total Tasks'],
            datasets: [{
                label: 'Task Status',
                data: [bottleneck.overdue, bottleneck.total],
                backgroundColor: ['rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)'],
                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Number of Tasks', color: '#FFFFFF' }, ticks: { color: '#FFFFFF', font: { family: 'IBM Plex Mono', size: 12 } } },
                x: { title: { display: true, text: 'Task Categories', color: '#FFFFFF' }, ticks: { color: '#FFFFFF', font: { family: 'IBM Plex Mono', size: 12 } } }
            },
            plugins: {
                legend: { position: 'top', labels: { color: '#FFFFFF', font: { family: 'IBM Plex Mono', size: 14 } } },
                title: { display: true, text: `Bottleneck Risk: ${bottleneck.risk}%`, color: '#FFFFFF', font: { family: 'IBM Plex Mono', size: 18 } },
                tooltip: { callbacks: { label: context => `${context.label}: ${context.raw}` } }
            }
        }
    });
}

// Financial Chart API Integration (Placeholder)
async function fetchFinancialData() {
    const proxyUrl = 'http://localhost:3000/financial';
    try {
        const response = await fetch(proxyUrl, { timeout: 5000 });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log('Financial Data:', data);
        return data.map(item => ({
            date: new Date(item.date),
            value: parseFloat(item.value) || 0
        })).slice(-12);
    } catch (error) {
        console.error('Error fetching financial data:', error);
        return [];
    }
}

function initializeFinancialChart() {
    const placeholders = document.querySelectorAll('.api-placeholder');
    placeholders.forEach(placeholder => {
        if (placeholder.dataset.type === 'technical-analysis') {
            fetchFinancialData().then(data => {
                if (data.length > 0) {
                    const labels = data.map(d => d.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })).filter((_, i) => i % 3 === 0);
                    new Chart(placeholder, {
                        type: 'line',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: 'Financial Indicator',
                                data: data.map(d => d.value).filter((_, i) => i % 3 === 0),
                                borderColor: 'rgba(75, 192, 192, 1)',
                                fill: false,
                                tension: 0.1
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                x: { title: { display: true, text: 'Date', color: '#FFFFFF' }, ticks: { color: '#FFFFFF', font: { family: 'IBM Plex Mono', size: 12 } } },
                                y: { title: { display: true, text: 'Value', color: '#FFFFFF' }, ticks: { color: '#FFFFFF', font: { family: 'IBM Plex Mono', size: 12 } } }
                            },
                            plugins: {
                                legend: { position: 'top', labels: { color: '#FFFFFF', font: { family: 'IBM Plex Mono', size: 14 } } },
                                title: { display: true, text: 'Financial Trend Analysis', color: '#FFFFFF', font: { family: 'IBM Plex Mono', size: 18 } }
                            }
                        }
                    });
                } else {
                    placeholder.textContent = 'Error loading financial chart';
                }
            });
        }
    });
}

// Initialize all charts and dashboards
document.addEventListener('DOMContentLoaded', async () => {
    initializeEconChart();
    const tasks = await fetchAsanaData();
    if (tasks.length > 0) updateAsanaDashboard(tasks);
    else document.getElementById('asanaChart').textContent = 'No Asana data available or error occurred.';
    initializeFinancialChart();
});