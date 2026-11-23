const axios = require('axios');
const fs = require('fs');
const path = require('path');

const getMlBaseUrl = () => process.env.ML_API_URL || 'http://127.0.0.1:8000';

const checkMlServiceHealth = async () => {
  try {
    const response = await axios.get(`${getMlBaseUrl()}/`, { timeout: 3500 });
    return {
      online: true,
      status: response.data.status || 'operational',
      modelLoaded: Boolean(response.data.modelLoaded),
      modelName: response.data.modelName || null,
      modelVersion: response.data.modelVersion || null,
    };
  } catch (error) {
    return {
      online: false,
      status: 'offline',
      modelLoaded: false,
      error: error.message,
    };
  }
};

const fetchMlModelInfo = async () => {
  try {
    const response = await axios.get(`${getMlBaseUrl()}/info`, { timeout: 5000 });
    if (response.data && response.data.success) {
      return { online: true, data: response.data.data };
    }
  } catch (_err) {
    // Fallback to reading local model_info.json artifact if Flask service is restarting
  }

  const localInfoPath = path.join(__dirname, '..', '..', 'ml-model', 'models', 'model_info.json');
  if (fs.existsSync(localInfoPath)) {
    const info = JSON.parse(fs.readFileSync(localInfoPath, 'utf-8'));
    return { online: false, data: info };
  }

  return { online: false, data: null };
};

const requestMlPrediction = async (payload) => {
  try {
    const response = await axios.post(`${getMlBaseUrl()}/predict`, payload, {
      timeout: 8000,
      headers: { 'Content-Type': 'application/json' },
    });
    return {
      httpStatus: response.status,
      data: response.data,
    };
  } catch (error) {
    if (error.response && error.response.data) {
      return {
        httpStatus: error.response.status,
        data: error.response.data,
      };
    }
    throw new Error(
      'Unable to reach the Python Machine Learning service at ' +
        getMlBaseUrl() +
        '. Please ensure the Flask ML server (app.py) is running on port 8000.'
    );
  }
};

module.exports = {
  checkMlServiceHealth,
  fetchMlModelInfo,
  requestMlPrediction,
};
