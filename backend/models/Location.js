const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    country: {
      type: String,
      default: 'India',
      required: true,
    },
    state: {
      type: String,
      required: true,
      index: true,
    },
    administrativeType: {
      type: String,
      enum: ['State', 'Union Territory'],
      default: 'State',
    },
    district: {
      type: String,
      required: true,
      index: true,
    },
    city: {
      type: String,
      required: true,
      index: true,
    },
    locality: {
      type: String,
      required: true,
      index: true,
    },
    stateCode: {
      type: String,
      required: true,
      index: true,
    },
    districtCode: {
      type: String,
      required: true,
    },
    cityCode: {
      type: String,
      required: true,
      index: true,
    },
    mlCovered: {
      type: Boolean,
      default: false,
    },
    baseRateSqFt: {
      type: Number,
      default: 4500,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

locationSchema.index({ state: 1, district: 1, city: 1, locality: 1 }, { unique: true });

module.exports = mongoose.model('Location', locationSchema);
