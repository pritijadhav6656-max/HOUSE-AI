const express = require('express');
const router = express.Router();
const { getUserDashboardAnalytics } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getUserDashboardAnalytics);

module.exports = router;
