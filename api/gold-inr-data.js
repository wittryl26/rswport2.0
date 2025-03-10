// Serverless function for gold/INR data endpoint
module.exports = (req, res) => {
  // This would typically fetch data from a database or external API
  const sampleData = [
    { date: '2023-01-01', value: 58000 },
    { date: '2023-02-01', value: 57500 },
    { date: '2023-03-01', value: 59000 },
    // Additional data points would go here
  ];

  res.json({
    data: sampleData,
    lastUpdated: new Date()
  });
};
