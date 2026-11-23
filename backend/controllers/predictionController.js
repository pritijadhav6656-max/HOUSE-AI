const Prediction = require('../models/Prediction');
const { requestMlPrediction } = require('../services/mlService');

const createPrediction = async (req, res, next) => {
  try {
    const {
      country = 'India',
      state,
      district = '',
      city,
      locality,
      propertyType = 'Apartment / Flat',
      area,
      bhk,
      bathrooms,
      balconies = 1,
      houseAge,
      furnishingStatus = 'Semi-Furnished',
      parking = 'Yes',
      floorNumber = 2,
      totalFloors = 5,
    } = req.body;

    const mlPayload = {
      state: state.trim(),
      district: district ? district.trim() : '',
      city: city.trim(),
      locality: locality.trim(),
      propertyType: propertyType.trim(),
      area: Number(area),
      bhk: Number(bhk),
      bathrooms: Number(bathrooms),
      balconies: Number(balconies),
      houseAge: Number(houseAge),
      furnishingStatus: furnishingStatus.trim(),
      parking: parking.trim(),
      floorNumber: Number(floorNumber),
      totalFloors: Number(totalFloors),
    };

    const mlResponse = await requestMlPrediction(mlPayload);

    if (mlResponse.httpStatus >= 400 || !mlResponse.data.success) {
      return res.status(mlResponse.httpStatus || 400).json({
        success: false,
        message: mlResponse.data.message || 'Machine learning validation error.',
        errors: mlResponse.data.errors || [],
      });
    }

    const mlData = mlResponse.data;

    const savedPrediction = await Prediction.create({
      userId: req.user._id,
      country: country.trim(),
      state: mlData.state,
      district: mlPayload.district,
      city: mlData.city,
      locality: mlData.locality,
      propertyType: mlPayload.propertyType,
      area: mlPayload.area,
      bhk: mlPayload.bhk,
      bathrooms: mlPayload.bathrooms,
      balconies: mlPayload.balconies,
      houseAge: mlPayload.houseAge,
      furnishingStatus: mlPayload.furnishingStatus,
      parking: mlPayload.parking,
      floorNumber: mlPayload.floorNumber,
      totalFloors: mlPayload.totalFloors,
      predictedPrice: mlData.predictedPrice,
      pricePerSqFt: mlData.pricePerSqFt,
      modelName: mlData.modelName,
      modelVersion: mlData.modelVersion,
      predictionCoverage: mlData.predictionCoverage,
      predictionStatus: mlData.predictionStatus || (mlData.coverageSupported ? 'completed' : 'unsupported_location'),
      disclaimer: mlData.disclaimer || '',
    });

    return res.status(201).json({
      success: true,
      coverageSupported: mlData.coverageSupported,
      message: mlData.coverageSupported
        ? 'Property valuation estimated and saved successfully.'
        : mlData.coverageMessage,
      data: {
        ...savedPrediction.toObject(),
        algorithm: mlData.algorithm,
        modelMetrics: mlData.modelMetrics || null,
        coverageMessage: mlData.coverageMessage || null,
        isSyntheticDataset: mlData.isSyntheticDataset !== false,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUserPredictions = async (req, res, next) => {
  try {
    const {
      search = '',
      city = '',
      locality = '',
      state = '',
      bhk = '',
      minPrice = '',
      maxPrice = '',
      status = '',
      sort = 'newest',
      page = 1,
      limit = 10,
    } = req.query;

    const filter = { userId: req.user._id };

    if (state.trim()) {
      filter.state = state.trim();
    }
    if (city.trim()) {
      filter.city = { $regex: city.trim(), $options: 'i' };
    }
    if (locality.trim()) {
      filter.locality = { $regex: locality.trim(), $options: 'i' };
    }
    if (search.trim()) {
      const regex = { $regex: search.trim(), $options: 'i' };
      filter.$or = [{ city: regex }, { locality: regex }, { state: regex }, { propertyType: regex }];
    }
    if (bhk !== '' && !Number.isNaN(Number(bhk))) {
      const bhkNum = Number(bhk);
      filter.bhk = bhkNum >= 5 ? { $gte: 5 } : bhkNum;
    }
    if (status.trim()) {
      filter.predictionStatus = status.trim();
    }
    if (minPrice !== '' || maxPrice !== '') {
      filter.predictedPrice = {};
      if (minPrice !== '' && !Number.isNaN(Number(minPrice))) {
        filter.predictedPrice.$gte = Number(minPrice);
      }
      if (maxPrice !== '' && !Number.isNaN(Number(maxPrice))) {
        filter.predictedPrice.$lte = Number(maxPrice);
      }
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_desc: { predictedPrice: -1, createdAt: -1 },
      price_asc: { predictedPrice: 1, createdAt: -1 },
    };
    const sortOption = sortMap[sort] || sortMap.newest;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [total, predictions] = await Promise.all([
      Prediction.countDocuments(filter),
      Prediction.find(filter).sort(sortOption).skip(skip).limit(limitNum).lean(),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      limit: limitNum,
      data: predictions,
    });
  } catch (error) {
    next(error);
  }
};

const getPredictionById = async (req, res, next) => {
  try {
    const prediction = await Prediction.findById(req.params.id).lean();
    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: 'Prediction record not found.',
      });
    }

    // Strict ownership check unless administrator
    if (
      prediction.userId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this prediction record.',
      });
    }

    return res.status(200).json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    next(error);
  }
};

const deletePrediction = async (req, res, next) => {
  try {
    const prediction = await Prediction.findById(req.params.id);
    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: 'Prediction record not found.',
      });
    }

    if (
      prediction.userId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this prediction record.',
      });
    }

    await prediction.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Prediction record deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPrediction,
  getUserPredictions,
  getPredictionById,
  deletePrediction,
};
