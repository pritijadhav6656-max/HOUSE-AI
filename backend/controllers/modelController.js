const ModelResult = require('../models/ModelResult');
const { fetchMlModelInfo, checkMlServiceHealth } = require('../services/mlService');

const getModelPerformanceInfo = async (_req, res, next) => {
  try {
    const [mlInfoResult, healthStatus, storedHistory] = await Promise.all([
      fetchMlModelInfo(),
      checkMlServiceHealth(),
      ModelResult.find().sort({ trainingDate: -1 }).limit(5).lean(),
    ]);

    if (!mlInfoResult.data) {
      return res.status(503).json({
        success: false,
        message: 'ML model metadata is currently unavailable. Please run python train.py in ml-model.',
      });
    }

    return res.status(200).json({
      success: true,
      serviceOnline: healthStatus.online,
      serviceStatus: healthStatus.status,
      data: mlInfoResult.data,
      storedModelRecords: storedHistory,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getModelPerformanceInfo };
