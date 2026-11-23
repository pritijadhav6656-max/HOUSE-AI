const User = require('../models/User');
const Prediction = require('../models/Prediction');
const Contact = require('../models/Contact');
const Location = require('../models/Location');
const { getDbStatus } = require('../config/db');
const { checkMlServiceHealth, fetchMlModelInfo } = require('../services/mlService');

const getAdminOverview = async (_req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      adminCount,
      totalPredictions,
      recentPredictionsCount,
      pendingContacts,
      totalContacts,
      locationRecordsCount,
      recentPredictions,
      recentUsers,
      mlHealth,
      mlInfoResult,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'admin' }),
      Prediction.countDocuments(),
      Prediction.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Contact.countDocuments({ status: 'pending' }),
      Contact.countDocuments(),
      Location.countDocuments(),
      Prediction.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      User.find()
        .select('name email role isActive createdAt')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      checkMlServiceHealth(),
      fetchMlModelInfo(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeUsers,
          inactiveUsers: totalUsers - activeUsers,
          adminCount,
          totalPredictions,
          recentPredictionsCount,
          pendingContacts,
          totalContacts,
          locationRecordsCount,
        },
        systemStatus: {
          database: getDbStatus(),
          mlService: mlHealth,
          activeModel: mlInfoResult.data
            ? {
                modelName: mlInfoResult.data.modelName,
                algorithm: mlInfoResult.data.algorithm,
                modelVersion: mlInfoResult.data.modelVersion,
                r2Score: mlInfoResult.data.metrics.r2Score,
                mae: mlInfoResult.data.metrics.mae,
                rmse: mlInfoResult.data.metrics.rmse,
                trainingDate: mlInfoResult.data.trainingDate,
                coveredCitiesCount: mlInfoResult.data.supportedLocations.coveredCitiesCount,
              }
            : null,
        },
        recentPredictions,
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

const listUsersAdmin = async (req, res, next) => {
  try {
    const { search = '', role = '', status = '', page = 1, limit = 15 } = req.query;
    const filter = {};

    if (search.trim()) {
      const regex = { $regex: search.trim(), $options: 'i' };
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }
    if (role === 'admin' || role === 'user') {
      filter.role = role;
    }
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select('-password -resetPasswordToken -resetPasswordExpire')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const updateUserRoleOrStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, isActive } = req.body;

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Target user account not found.',
      });
    }

    // Prevent administrator from demoting or deactivating their own currently active session
    if (targetUser._id.toString() === req.user._id.toString()) {
      if (role && role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'You cannot revoke your own administrator role.',
        });
      }
      if (typeof isActive === 'boolean' && !isActive) {
        return res.status(400).json({
          success: false,
          message: 'You cannot deactivate your own active administrator account.',
        });
      }
    }

    if (role && ['user', 'admin'].includes(role)) {
      targetUser.role = role;
    }
    if (typeof isActive === 'boolean') {
      targetUser.isActive = isActive;
    }

    await targetUser.save();

    return res.status(200).json({
      success: true,
      message: 'User account updated successfully.',
      user: targetUser.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

const deleteUserAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own active administrator account.',
      });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    await Prediction.deleteMany({ userId: targetUser._id });
    await targetUser.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'User account and associated predictions deleted.',
    });
  } catch (error) {
    next(error);
  }
};

const listAllPredictionsAdmin = async (req, res, next) => {
  try {
    const {
      search = '',
      state = '',
      city = '',
      userId = '',
      sort = 'newest',
      page = 1,
      limit = 15,
    } = req.query;

    const filter = {};
    if (state.trim()) filter.state = state.trim();
    if (city.trim()) filter.city = { $regex: city.trim(), $options: 'i' };
    if (userId.trim()) filter.userId = userId.trim();
    if (search.trim()) {
      const regex = { $regex: search.trim(), $options: 'i' };
      filter.$or = [{ city: regex }, { locality: regex }, { state: regex }, { propertyType: regex }];
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_desc: { predictedPrice: -1 },
      price_asc: { predictedPrice: 1 },
    };
    const sortOption = sortMap[sort] || sortMap.newest;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    const [total, predictions] = await Promise.all([
      Prediction.countDocuments(filter),
      Prediction.find(filter)
        .populate('userId', 'name email')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: predictions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminOverview,
  listUsersAdmin,
  updateUserRoleOrStatus,
  deleteUserAdmin,
  listAllPredictionsAdmin,
};
