const express = require('express');
const { getQueueStatus } = require('../controllers/queueController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getQueueStatus);

module.exports = router;
