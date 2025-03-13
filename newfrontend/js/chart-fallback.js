/**
 * Fallback handler for chart loading issues
 */

(function() {
    // Ensure Chart.js is available
    function checkChartJs() {
        if (typeof Chart === 'undefined') {
            console.error('Chart.js not available, loading fallback');
            loadFallbackChartJs();
            return false;
        }
        return true;
    }

    // Load Chart.js from alternate CDN
    function loadFallbackChartJs() {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js';
        script.onload = function() {
            console.log('Fallback Chart.js loaded successfully');
            initializeCharts();
        };
        document.head.appendChild(script);
    }

    // Initialize charts after ensuring Chart.js is loaded
    function initializeCharts() {
        if (!checkChartJs()) return;
        
        const chartContainer = document.getElementById('gold-rupee-chart');
        if (chartContainer && typeof loadGoldRupeeChart === 'function') {
            loadGoldRupeeChart('gold-rupee-chart');
        }
    }

    // Run on page load
    window.addEventListener('load', initializeCharts);
})();
