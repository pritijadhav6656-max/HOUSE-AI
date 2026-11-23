const express = require('express');
const router = express.Router();
const { submitContactMessage } = require('../controllers/contactController');
const {
  validateRequest,
  contactValidationRules,
} = require('../validators/requestValidators');

router.post('/', contactValidationRules, validateRequest, submitContactMessage);

module.exports = router;
