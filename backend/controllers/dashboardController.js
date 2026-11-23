const mongoose = require('mongoose');
const Prediction = require('../models/Prediction');
const { fetchMlModelInfo } = require('../services/mlService');

const getUserDashboardAnalytics = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalPredictions,
      recent30DaysCount,
      recentPredictions,
      cityDistribution,
      bhkDistribution,
      monthlyActivityRaw,
      completedPredictions,
      mlModelInfoResult,
    ] = await Promise.all([
      Prediction.countDocuments({ userId }),
      Prediction.countDocuments({ userId, createdAt: { $gte: thirtyDaysAgo } }),
      Prediction.find({ userId }).sort({ createdAt: -1 }).limit(6).lean(),
      Prediction.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$city',
            count: { $sum: 1 },
            avgPrice: { $avg: '$predictedPrice' },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      Prediction.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$bhk',
            count: { $sum: 1 },
            avgPrice: { $avg: '$predictedPrice' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Prediction.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
            avgPrice: { $avg: '$predictedPrice' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]),
      Prediction.find({ userId, predictionStatus: 'completed', predictedPrice: { $ne: null } })
        .select('predictedPrice pricePerSqFt area city state bhk propertyType')
        .lean(),
      fetchMlModelInfo(),
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyActivity = monthlyActivityRaw.map((item) => ({
      month: `${monthNames[(item._id.month || 1) - 1]} ${item._id.year}`,
      predictions: item.count,
      avgPriceLakhs: item.avgPrice ? Number((item.avgPrice / 100000).toFixed(2)) : 0,
    }));

    // Price range buckets based on actual stored user predictions
    const buckets = [
      { range: 'Under ₹50L', min: 0, max: 5000000, count: 0 },
      { range: '₹50L - ₹1Cr', min: 5000000, max: 10000000, count: 0 },
      { range: '₹1Cr - ₹2Cr', min: 10000000, max: 20000000, count: 0 },
      { range: 'Above ₹2Cr', min: 20000000, max: Infinity, count: 0 },
    ];

    let sumPrice = 0;
    let sumSqFt = 0;
    for (const p of completedPredictions) {
      sumPrice += p.predictedPrice || 0;
      sumSqFt += p.pricePerSqFt || 0;
      for (const b of buckets) {
        if (p.predictedPrice >= b.min && p.predictedPrice < b.max) {
          b.count += 1;
          break;
        }
      }
    }

    const completedCount = completedPredictions.length;
    const avgPredictedPrice = completedCount > 0 ? Math.round(sumPrice / completedCount) : 0;
    const avgPricePerSqFt = completedCount > 0 ? Math.round(sumSqFt / completedCount) : 0;

    const modelInfo = mlModelInfoResult.data;
    const modelR2Score = modelInfo && modelInfo.metrics ? modelInfo.metrics.r2Score : null;

    // Generate authentic data-driven insights from the user's actual stored history
    const insights = [];
    if (totalPredictions === 0) {
      insights.push({
        title: 'No Historical Predictions Yet',
        description:
          'Submit your first residential property valuation to unlock personalized city distribution, BHK breakdown, and price-per-sq.ft. analytics.',
        type: 'info',
      });
    } else {
      if (cityDistribution.length > 0) {
        const topCity = cityDistribution[0];
        insights.push({
          title: 'Most Researched Urban Market',
          description: `${topCity._id} accounts for ${topCity.count} of your ${totalPredictions} stored predictions${
            topCity.avgPrice
              ? ` with an average estimated value of ₹${(topCity.avgPrice / 100000).toFixed(2)} Lakhs.`
              : '.'
          }`,
          type: 'primary',
        });
      }
      if (completedCount > 0) {
        insights.push({
          title: 'Portfolio Valuation Summary',
          description: `Across your ${completedCount} completed estimates, the mean predicted valuation is ₹${(
            avgPredictedPrice / 100000
          ).toFixed(2)} Lakhs at an average rate of ₹${avgPricePerSqFt.toLocaleString('en-IN')}/sq.ft.`,
          type: 'success',
        });
      }
    }

    if (modelInfo) {
      insights.push({
        title: 'Active ML Engine Coverage',
        description: `${modelInfo.modelName} (${modelInfo.algorithm}) achieves a test R² score of ${modelInfo.metrics.r2Score} across ${modelInfo.supportedLocations.coveredCitiesCount} covered Indian cities (Synthetic Benchmark Dataset).`,
        type: 'neutral',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalPredictions,
          recent30DaysCount,
          completedPredictionsCount: completedCount,
          avgPredictedPrice,
          avgPricePerSqFt,
          modelR2Score,
          modelName: modelInfo ? modelInfo.modelName : 'Unavailable',
          algorithm: modelInfo ? modelInfo.algorithm : 'Unavailable',
        },
        recentPredictions,
        charts: {
          monthlyActivity,
          cityDistribution: cityDistribution.map((c) => ({
            city: c._id,
            count: c.count,
            avgPriceLakhs: c.avgPrice ? Number((c.avgPrice / 100000).toFixed(2)) : 0,
          })),
          bhkDistribution: bhkDistribution.map((b) => ({
            bhk: `${b._id} BHK`,
            count: b.count,
            avgPriceLakhs: b.avgPrice ? Number((b.avgPrice / 100000).toFixed(2)) : 0,
          })),
          priceRangeDistribution: buckets.map(({ range, count }) => ({ range, count })),
        },
        insights,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserDashboardAnalytics };
