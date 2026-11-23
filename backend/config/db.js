const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Location = require('../models/Location');
const ModelResult = require('../models/ModelResult');

let isConnected = false;
let embeddedMongoServer = null;
let connectionMode = 'external';

const syncInitialCollections = async () => {
  try {
    // 1. Sync India-wide locations if collection is empty
    const locationCount = await Location.countDocuments();
    if (locationCount === 0) {
      const locFilePath = path.join(__dirname, 'india_locations.json');
      if (fs.existsSync(locFilePath)) {
        const raw = JSON.parse(fs.readFileSync(locFilePath, 'utf-8'));
        if (Array.isArray(raw.flatLocations) && raw.flatLocations.length > 0) {
          await Location.insertMany(raw.flatLocations, { ordered: false }).catch(() => {});
          console.log(
            `[MongoDB] Seeded ${raw.flatLocations.length} India-wide locality records into 'locations' collection.`
          );
        }
      }
    }

    // 2. Sync ML ModelResult record from model_info.json
    const modelInfoPath = path.join(__dirname, '..', '..', 'ml-model', 'models', 'model_info.json');
    if (fs.existsSync(modelInfoPath)) {
      const info = JSON.parse(fs.readFileSync(modelInfoPath, 'utf-8'));
      await ModelResult.findOneAndUpdate(
        { modelName: info.modelName, modelVersion: info.modelVersion },
        {
          modelName: info.modelName,
          algorithm: info.algorithm,
          r2Score: info.metrics.r2Score,
          mae: info.metrics.mae,
          rmse: info.metrics.rmse,
          datasetRecords: info.datasetInfo.datasetRecords,
          trainingRecords: info.datasetInfo.trainingRecords,
          testingRecords: info.datasetInfo.testingRecords,
          trainingDate: new Date(info.trainingDate),
          modelVersion: info.modelVersion,
          supportedLocations: {
            coveredStatesCount: info.supportedLocations.coveredStatesCount,
            coveredCitiesCount: info.supportedLocations.coveredCitiesCount,
            coveredLocalitiesCount: info.supportedLocations.coveredLocalitiesCount,
          },
          isSynthetic: info.datasetInfo.isSynthetic,
        },
        { upsert: true, new: true }
      );
    }
  } catch (err) {
    console.warn('[MongoDB] Initial collection sync warning:', err.message);
  }
};

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/houseprice_ai';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    connectionMode = 'external';
    console.log(
      `[MongoDB] Connected to external MongoDB database: ${conn.connection.name} at ${conn.connection.host}`
    );
    await syncInitialCollections();
    return true;
  } catch (externalErr) {
    console.warn(
      `[MongoDB] External MongoDB at ${uri} unreachable (${externalErr.message}). Starting local mongod instance on 127.0.0.1:27017...`
    );
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      try {
        embeddedMongoServer = await MongoMemoryServer.create({
          instance: {
            port: 27017,
            ip: '127.0.0.1',
            dbName: 'houseprice_ai',
          },
        });
      } catch (_portBusyErr) {
        embeddedMongoServer = await MongoMemoryServer.create({
          instance: {
            ip: '127.0.0.1',
            dbName: 'houseprice_ai',
          },
        });
      }

      const fallbackUri = `${embeddedMongoServer.getUri()}houseprice_ai`;
      const conn = await mongoose.connect(fallbackUri);
      isConnected = true;
      connectionMode = 'local-mongod';
      console.log(
        `[MongoDB] Connected to local mongod instance (${conn.connection.name}) at ${fallbackUri}`
      );
      await syncInitialCollections();
      return true;
    } catch (fallbackErr) {
      isConnected = false;
      console.error(`[MongoDB] Failed to start or connect to MongoDB: ${fallbackErr.message}`);
      return false;
    }
  }
};

const getDbStatus = () => {
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return {
    connected: mongoose.connection.readyState === 1 || isConnected,
    state: stateMap[mongoose.connection.readyState] || 'disconnected',
    database: mongoose.connection.name || 'houseprice_ai',
    mode: connectionMode,
  };
};

module.exports = { connectDB, getDbStatus, syncInitialCollections };
