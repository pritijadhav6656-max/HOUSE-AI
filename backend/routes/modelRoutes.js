const express = require('express');
const router = express.Router();
const { getModelPerformanceInfo } = require('../controllers/modelController');

router.get('/info', getModelPerformanceInfo);
router.get('/', getModelPerformanceInfo);

module.exports = router;
