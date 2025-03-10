const express = require('express');
const router = express.Router();
const { query } = require('../database');

// Get economic data
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM economic_data ORDER BY date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching economic data:', error);
    res.status(500).json({ error: 'Failed to fetch economic data' });
  }
});

module.exports = router;
