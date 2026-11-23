const { body, validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extracted = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return res.status(400).json({
      success: false,
      message: extracted[0].message,
      errors: extracted,
    });
  }
  next();
};

const registerValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required.')
    .isLength({ min: 2, max: 80 })
    .withMessage('Name must be between 2 and 80 characters.'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.')
    .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/)
    .withMessage('Password must contain at least one letter and one number.'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Please confirm your password.')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match.');
      }
      return true;
    }),
];

const loginValidationRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.'),
];

const forgotPasswordValidationRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .normalizeEmail(),
];

const resetPasswordValidationRules = [
  body('token')
    .trim()
    .notEmpty()
    .withMessage('Password reset token is required.'),
  body('password')
    .notEmpty()
    .withMessage('New password is required.')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long.')
    .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/)
    .withMessage('New password must contain at least one letter and one number.'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Please confirm your new password.')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match.');
      }
      return true;
    }),
];

const predictionValidationRules = [
  body('state').trim().notEmpty().withMessage('State selection is required.'),
  body('city').trim().notEmpty().withMessage('City selection is required.'),
  body('locality').trim().notEmpty().withMessage('Locality selection is required.'),
  body('propertyType')
    .trim()
    .isIn(['Apartment / Flat', 'Independent House', 'Villa', 'Residential Property'])
    .withMessage('Valid property type is required.'),
  body('area')
    .isFloat({ gt: 0, max: 50000 })
    .withMessage('Area must be greater than 0 and up to 50,000 sq.ft.'),
  body('bhk')
    .isInt({ min: 1, max: 15 })
    .withMessage('BHK must be a positive integer between 1 and 15.'),
  body('bathrooms')
    .isInt({ min: 1, max: 15 })
    .withMessage('Bathrooms must be a positive integer between 1 and 15.'),
  body('houseAge')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Property age cannot be negative (0 to 100 years).'),
];

const contactValidationRules = [
  body('name').trim().notEmpty().withMessage('Your name is required.').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
  body('subject').trim().notEmpty().withMessage('Subject is required.').isLength({ max: 200 }),
  body('message').trim().notEmpty().withMessage('Message content is required.').isLength({ min: 10, max: 3000 }).withMessage('Message must be between 10 and 3000 characters.'),
];

module.exports = {
  validateRequest,
  registerValidationRules,
  loginValidationRules,
  forgotPasswordValidationRules,
  resetPasswordValidationRules,
  predictionValidationRules,
  contactValidationRules,
};
