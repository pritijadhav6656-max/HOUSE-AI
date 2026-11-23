const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  logoutUser,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
  validateRequest,
  registerValidationRules,
  loginValidationRules,
  forgotPasswordValidationRules,
  resetPasswordValidationRules,
} = require('../validators/requestValidators');

router.post('/register', registerValidationRules, validateRequest, registerUser);
router.post('/login', loginValidationRules, validateRequest, loginUser);
router.post('/forgot-password', forgotPasswordValidationRules, validateRequest, forgotPassword);
router.post('/reset-password', resetPasswordValidationRules, validateRequest, resetPassword);
router.get('/me', protect, getCurrentUser);
router.post('/logout', protect, logoutUser);

module.exports = router;
