const express = require('express');
const router = express.Router();
const {
  createPrediction,
  getUserPredictions,
  getPredictionById,
  deletePrediction,
} = require('../controllers/predictionController');
const { protect } = require('../middleware/authMiddleware');
const {
  validateRequest,
  predictionValidationRules,
} = require('../validators/requestValidators');

router.use(protect);

router.post('/', predictionValidationRules, validateRequest, createPrediction);
router.get('/', getUserPredictions);
router.get('/:id', getPredictionById);
router.delete('/:id', deletePrediction);

module.exports = router;
