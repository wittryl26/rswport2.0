const express = require('express');
const router = express.Router();
const { query } = require('../database');

// Get financial data
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM financial_data ORDER BY date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching financial data:', error);
    res.status(500).json({ error: 'Failed to fetch financial data' });
  }
});

module.exports = router;
