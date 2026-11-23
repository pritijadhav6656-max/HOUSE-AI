const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    country: {
      type: String,
      default: 'India',
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      index: true,
    },
    district: {
      type: String,
      default: '',
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    locality: {
      type: String,
      required: [true, 'Locality is required'],
      trim: true,
    },
    propertyType: {
      type: String,
      required: [true, 'Property type is required'],
      enum: ['Apartment / Flat', 'Independent House', 'Villa', 'Residential Property'],
      default: 'Apartment / Flat',
    },
    area: {
      type: Number,
      required: [true, 'Area in sq.ft. is required'],
      min: [100, 'Area must be at least 100 sq.ft.'],
    },
    bhk: {
      type: Number,
      required: [true, 'BHK configuration is required'],
      min: [1, 'BHK must be at least 1'],
    },
    bathrooms: {
      type: Number,
      required: [true, 'Number of bathrooms is required'],
      min: [1, 'Bathrooms must be at least 1'],
    },
    balconies: {
      type: Number,
      default: 1,
      min: 0,
    },
    houseAge: {
      type: Number,
      required: [true, 'Property age is required'],
      min: [0, 'Property age cannot be negative'],
    },
    furnishingStatus: {
      type: String,
      enum: ['Unfurnished', 'Semi-Furnished', 'Fully Furnished'],
      default: 'Semi-Furnished',
    },
    parking: {
      type: String,
      enum: ['Yes', 'No'],
      default: 'Yes',
    },
    floorNumber: {
      type: Number,
      default: 2,
      min: 0,
    },
    totalFloors: {
      type: Number,
      default: 5,
      min: 1,
    },
    predictedPrice: {
      type: Number,
      default: null,
    },
    pricePerSqFt: {
      type: Number,
      default: null,
    },
    modelName: {
      type: String,
      required: true,
    },
    modelVersion: {
      type: String,
      required: true,
    },
    predictionCoverage: {
      type: String,
      default: 'Full Micro-Market Coverage',
    },
    predictionStatus: {
      type: String,
      enum: ['completed', 'unsupported_location', 'failed'],
      default: 'completed',
    },
    disclaimer: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

predictionSchema.index({ userId: 1, createdAt: -1 });
predictionSchema.index({ state: 1, city: 1 });
predictionSchema.index({ predictedPrice: 1 });

module.exports = mongoose.model('Prediction', predictionSchema);
