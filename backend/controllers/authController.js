const User = require('../models/User');
const {
  generateJwtToken,
  generatePasswordResetToken,
  hashResetToken,
} = require('../utils/tokenUtils');

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address is already registered.',
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone ? phone.trim() : '',
      role: 'user',
    });

    const token = generateJwtToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is currently deactivated. Please contact support.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
    }

    const token = generateJwtToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: 'Signed in successfully.',
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }
    return res.status(200).json({
      success: true,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with that email address.',
      });
    }

    const { rawToken, hashedToken, expireDate } = generatePasswordResetToken();
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = expireDate;
    await user.save({ validateBeforeSave: false });

    const responsePayload = {
      success: true,
      message: 'Password reset token generated. It is valid for 15 minutes.',
      expiresInMinutes: 15,
    };

    // Documented development-only alternative when external SMTP is not configured
    if (process.env.NODE_ENV !== 'production') {
      responsePayload.devModeNote =
        'Development mode: SMTP server is not configured. Use the verification token below to complete password reset.';
      responsePayload.devResetToken = rawToken;
    }

    return res.status(200).json(responsePayload);
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const hashedToken = hashResetToken(token.trim());

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() },
    }).select('+password +resetPasswordToken +resetPasswordExpire');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token.',
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const jwtToken = generateJwtToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: 'Your password has been reset successfully.',
      token: jwtToken,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

const logoutUser = async (_req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  logoutUser,
};
