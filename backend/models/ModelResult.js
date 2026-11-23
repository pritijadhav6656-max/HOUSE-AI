const mongoose = require('mongoose');

const modelResultSchema = new mongoose.Schema(
  {
    modelName: {
      type: String,
      required: true,
    },
    algorithm: {
      type: String,
      required: true,
    },
    r2Score: {
      type: Number,
      required: true,
    },
    mae: {
      type: Number,
      required: true,
    },
    rmse: {
      type: Number,
      required: true,
    },
    datasetRecords: {
      type: Number,
      required: true,
    },
    trainingRecords: {
      type: Number,
      required: true,
    },
    testingRecords: {
      type: Number,
      required: true,
    },
    trainingDate: {
      type: Date,
      required: true,
    },
    modelVersion: {
      type: String,
      required: true,
    },
    supportedLocations: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isSynthetic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ModelResult', modelResultSchema);
