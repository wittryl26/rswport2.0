// Serverless function for health check endpoint
module.exports = (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
};
