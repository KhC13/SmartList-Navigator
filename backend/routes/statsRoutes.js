const express = require('express');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/stats -> aggregated numbers for the Dashboard page
router.get('/', protect, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const io = req.app.get('io');
    const activeCustomers = io ? io.engine.clientsCount : 0;

    res.json({ totalProducts, activeCustomers });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats', error: err.message });
  }
});

module.exports = router;
