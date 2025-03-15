export default function handler(req, res) {
    // Always return static data to ensure the chart works
    res.status(200).json({
        title: "Gold Price vs USD/INR Exchange Rate",
        data: [
            { date: '2022-01-01', goldPrice: 1150.90, rupeeRate: 67.19 },
            { date: '2022-02-01', goldPrice: 1265.35, rupeeRate: 65.11 },
            { date: '2022-03-01', goldPrice: 1322.10, rupeeRate: 68.39 },
            { date: '2022-04-01', goldPrice: 1523.00, rupeeRate: 70.42 },
            { date: '2022-05-01', goldPrice: 1887.60, rupeeRate: 74.13 },
            { date: '2022-06-01', goldPrice: 1794.25, rupeeRate: 73.93 },
            { date: '2022-07-01', goldPrice: 1824.95, rupeeRate: 76.23 }
        ]
    });
}
