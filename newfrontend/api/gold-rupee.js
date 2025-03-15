export default function handler(req, res) {
    // Return static data
    res.status(200).json({
        labels: ['2016', '2017', '2018', '2019', '2020', '2021', '2022'],
        datasets: [{
            label: 'Gold Price (USD)',
            data: [1150.90, 1265.35, 1322.10, 1523.00, 1887.60, 1794.25, 1824.95],
            yAxisID: 'y'
        }, {
            label: 'INR/USD Rate',
            data: [67.19, 65.11, 68.39, 70.42, 74.13, 73.93, 76.23],
            yAxisID: 'y1'
        }]
    });
}
