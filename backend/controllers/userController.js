const User = require('../models/User');
const Prediction = require('../models/Prediction');

const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    const totalPredictions = await Prediction.countDocuments({ userId: user._id });

    return res.status(200).json({
      success: true,
      user: user.toSafeObject(),
      stats: {
        totalPredictions,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    const { name, phone, profileImage, notificationPreferences } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    if (typeof name === 'string' && name.trim().length >= 2) {
      user.name = name.trim();
    }
    if (typeof phone === 'string') {
      user.phone = phone.trim();
    }
    if (typeof profileImage === 'string') {
      user.profileImage = profileImage.trim();
    }
    if (notificationPreferences && typeof notificationPreferences === 'object') {
      user.notificationPreferences = {
        emailAlerts:
          typeof notificationPreferences.emailAlerts === 'boolean'
            ? notificationPreferences.emailAlerts
            : user.notificationPreferences.emailAlerts,
        reportSummaries:
          typeof notificationPreferences.reportSummaries === 'boolean'
            ? notificationPreferences.reportSummaries
            : user.notificationPreferences.reportSummaries,
        modelUpdates:
          typeof notificationPreferences.modelUpdates === 'boolean'
            ? notificationPreferences.modelUpdates
            : user.notificationPreferences.modelUpdates,
      };
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password, new password, and confirmation are required.',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation do not match.',
      });
    }

    if (newPassword.length < 8 || !/^(?=.*[A-Za-z])(?=.*\d).+$/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters and include a letter and a number.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
};
