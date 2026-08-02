const express = require('express');
const { planRoute } = require('../controllers/routeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, planRoute);

module.exports = router;
