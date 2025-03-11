/**
 * Animation Effects
 * Generated merge
 * Merged on: 2025-03-11T00:02:03.116Z
 */


// ===============================================
// Source: finance-hero-animation.js
// ===============================================

/**
 * Professional Financial Hero Animation
 * Creates a dynamic, business-oriented background animation
 * with financial data visualization elements
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if hero section exists
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;
    
    // Create canvas for animation
    const canvas = document.createElement('canvas');
    canvas.className = 'finance-canvas';
    heroSection.appendChild(canvas);
    
    // Get canvas context
    const ctx = canvas.getContext('2d');
    
    // Animation settings
    let width = heroSection.offsetWidth;
    let height = heroSection.offsetHeight;
    
    // Financial data visualization elements
    const dataPoints = [];
    const chartLines = [];
    const gridLines = [];
    
    // Market trend simulation variables
    let trendDirection = 1; // 1 = up, -1 = down
    let trendStrength = 0.5; // How strongly the trend influences movement
    let volatility = 0.3; // Random movement factor
    let trendChangeProbability = 0.005; // Chance of trend reversal
    
    // Initialize canvas
    function initCanvas() {
        canvas.width = width;
        canvas.height = height;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.zIndex = '0';
    }
    
    // Create vertical grid lines
    function createGridLines() {
        const spacing = 80; // Distance between vertical lines
        for (let x = spacing; x < width; x += spacing) {
            gridLines.push({
                x: x,
                opacity: 0.08 + (Math.random() * 0.05)
            });
        }
    }
    
    // Create chart lines (horizontal trend lines)
    function createChartLines() {
        // Create 3-5 chart lines with different heights and speeds
        const count = Math.floor(Math.random() * 3) + 3;
        const baseHeight = height * 0.6; // Base height in the lower part of the canvas
        
        for (let i = 0; i < count; i++) {
            const points = [];
            const pointCount = Math.floor(width / 30); // Point every 30px
            const chartHeight = baseHeight - (i * 50) - (Math.random() * 50);
            const amplitude = 20 + (i * 5) + (Math.random() * 15);
            const speed = 0.2 + (Math.random() * 0.3);
            
            // Generate initial points
            for (let j = 0; j < pointCount; j++) {
                points.push({
                    x: j * 30,
                    y: chartHeight + (Math.sin(j * 0.2) * amplitude),
                    targetY: chartHeight + (Math.sin(j * 0.2) * amplitude)
                });
            }
            
            chartLines.push({
                points: points,
                color: `rgba(100, 255, 218, ${0.15 + (i * 0.1)})`,
                speed: speed,
                amplitude: amplitude,
                baseHeight: chartHeight
            });
        }
    }
    
    // Create data points (rising/falling dots)
    function createDataPoints() {
        const count = 30; // Number of data points
        
        for (let i = 0; i < count; i++) {
            dataPoints.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: 1 + Math.random() * 2.5,
                speed: 0.2 + Math.random() * 0.6,
                color: Math.random() > 0.5 ? 
                      `rgba(100, 255, 218, ${0.3 + Math.random() * 0.4})` : 
                      `rgba(139, 42, 58, ${0.3 + Math.random() * 0.4})`,
                direction: Math.random() > 0.5 ? 1 : -1
            });
        }
    }
    
    // Create subtle candlestick patterns in the background
    function createCandlesticks() {
        const candleCount = Math.floor(width / 40);
        const candlesticks = [];
        const baseY = height * 0.75;
        
        for (let i = 0; i < candleCount; i++) {
            const open = baseY + (Math.random() * 30) - 15;
            const close = open + (Math.random() * 30) - 15;
            const isUp = close < open;
            const high = Math.min(open, close) - (Math.random() * 10) - 5;
            const low = Math.max(open, close) + (Math.random() * 10) + 5;
            
            candlesticks.push({
                x: i * 40 + 20,
                open: open,
                close: close,
                high: high,
                low: low,
                color: isUp ? 'rgba(100, 255, 218, 0.15)' : 'rgba(139, 42, 58, 0.15)',
                width: 10 + (Math.random() * 5)
            });
        }
        
        return candlesticks;
    }
    
    // Draw all visual elements
    function drawElements() {
        ctx.clearRect(0, 0, width, height);
        
        // Draw faint grid
        drawGrid();
        
        // Draw chart lines
        drawChartLines();
        
        // Draw data points
        drawDataPoints();
        
        // Request next frame
        requestAnimationFrame(drawElements);
    }
    
    // Draw vertical grid lines
    function drawGrid() {
        gridLines.forEach(line => {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${line.opacity})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(line.x, 0);
            ctx.lineTo(line.x, height);
            ctx.stroke();
        });
        
        // Draw a few horizontal grid lines
        for (let y = height * 0.3; y < height * 0.9; y += height * 0.1) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 0.5;
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }
    
    // Draw and animate chart lines
    function drawChartLines() {
        chartLines.forEach(line => {
            // First update the points
            updateChartLine(line);
            
            // Then draw the line
            ctx.beginPath();
            ctx.strokeStyle = line.color;
            ctx.lineWidth = 1.5;
            
            // Start at first point
            ctx.moveTo(line.points[0].x, line.points[0].y);
            
            // Draw line through all points
            for (let i = 1; i < line.points.length; i++) {
                ctx.lineTo(line.points[i].x, line.points[i].y);
            }
            
            ctx.stroke();
            
            // Add slight gradient fill below the line
            ctx.lineTo(line.points[line.points.length - 1].x, height);
            ctx.lineTo(line.points[0].x, height);
            ctx.closePath();
            
            const gradient = ctx.createLinearGradient(0, line.baseHeight - line.amplitude, 0, height);
            gradient.addColorStop(0, line.color);
            gradient.addColorStop(1, 'rgba(100, 255, 218, 0)');
            ctx.fillStyle = gradient;
            ctx.fill();
        });
    }
    
    // Update chart line points to simulate market movement
    function updateChartLine(line) {
        // Possibly change the market trend direction
        if (Math.random() < trendChangeProbability) {
            trendDirection *= -1;
        }
        
        // Shift all points to the left
        for (let i = 0; i < line.points.length - 1; i++) {
            line.points[i].targetY = line.points[i + 1].targetY;
        }
        
        // Generate a new target for the last point based on trend and volatility
        const lastPoint = line.points[line.points.length - 1];
        const trendMovement = trendDirection * trendStrength * line.amplitude * 0.1;
        const randomMovement = (Math.random() - 0.5) * volatility * line.amplitude * 0.2;
        
        // Ensure the new point stays within reasonable bounds
        let newTargetY = lastPoint.targetY + trendMovement + randomMovement;
        const maxDeviation = line.amplitude * 1.5;
        const upperBound = line.baseHeight - maxDeviation;
        const lowerBound = line.baseHeight + maxDeviation;
        
        newTargetY = Math.max(upperBound, Math.min(lowerBound, newTargetY));
        
        // Update the last point's target
        line.points[line.points.length - 1].targetY = newTargetY;
        
        // Move all points toward their targets
        for (let i = 0; i < line.points.length; i++) {
            const point = line.points[i];
            point.y += (point.targetY - point.y) * line.speed;
        }
    }
    
    // Draw and animate data points (moving dots)
    function drawDataPoints() {
        dataPoints.forEach(point => {
            // Update position
            point.y += point.speed * point.direction;
            
            // Reset when out of bounds
            if (point.y < 0 || point.y > height) {
                point.direction *= -1;
                point.y += point.speed * point.direction * 2; // Prevent getting stuck at edges
            }
            
            // Draw the point
            ctx.beginPath();
            ctx.fillStyle = point.color;
            ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    // Handle window resize
    function handleResize() {
        width = heroSection.offsetWidth;
        height = heroSection.offsetHeight;
        initCanvas();
        
        // Reset visual elements
        gridLines.length = 0;
        chartLines.length = 0;
        dataPoints.length = 0;
        
        // Create new elements for the new size
        createGridLines();
        createChartLines();
        createDataPoints();
    }
    
    // Initialize everything
    initCanvas();
    createGridLines();
    createChartLines();
    createDataPoints();
    drawElements();
    
    // Event listeners
    window.addEventListener('resize', handleResize);
    
    // Interactive effect on mouse move
    let mouseX = 0;
    let mouseY = 0;
    
    heroSection.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY - heroSection.getBoundingClientRect().top;
        
        // Influence nearby chart points
        chartLines.forEach(line => {
            line.points.forEach(point => {
                const dx = mouseX - point.x;
                const dy = mouseY - point.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    // Pull points slightly toward mouse
                    point.targetY -= (100 - distance) * 0.05 * (mouseY < point.y ? 1 : -1);
                }
            });
        });
    });
    
    // Update the typewriter effect for the subtitle for business theme
    const subtitle = document.querySelector('.subtitle');
    if (subtitle && subtitle.textContent.trim() === "Professional Portfolio") {
        subtitle.textContent = '';
        
        // Business-themed phrases
        const phrases = [
            "Financial Analysis",
            "Investment Strategy",
            "Business Operations"
        ];
        
        let currentPhrase = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 80;
        let pauseEnd = 0;
        
        function typeText() {
            const phrase = phrases[currentPhrase];
            
            // Set typing speed based on action
            if (isDeleting) {
                typingSpeed = 30; // Delete faster
            } else {
                // Type slower towards end of phrase
                typingSpeed = 80 + ((charIndex / phrase.length) * 60);
            }
            
            // Check if we're pausing
            if (pauseEnd > Date.now()) {
                setTimeout(typeText, 50);
                return;
            }
            
            if (!isDeleting) {
                // Add next character
                if (charIndex < phrase.length) {
                    subtitle.textContent = phrase.substring(0, charIndex + 1);
                    charIndex++;
                    setTimeout(typeText, typingSpeed);
                } else {
                    // End of phrase - pause before deleting
                    pauseEnd = Date.now() + 2000; // Pause for 2 seconds
                    isDeleting = true;
                    setTimeout(typeText, pauseEnd - Date.now());
                }
            } else {
                // Remove character
                if (charIndex > 0) {
                    subtitle.textContent = phrase.substring(0, charIndex - 1);
                    charIndex--;
                    setTimeout(typeText, typingSpeed);
                } else {
                    // Move to next phrase
                    isDeleting = false;
                    currentPhrase = (currentPhrase + 1) % phrases.length;
                    setTimeout(typeText, 500);
                }
            }
        }
        
        // Start typing after a delay
        setTimeout(typeText, 1000);
    }
});



// ===============================================
// Source: hero-animation.js
// ===============================================

// Remove this file entirely and revert to a simpler hero section


