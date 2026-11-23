const locationService = require('../services/locationService');

const listCountries = (_req, res, next) => {
  try {
    const countries = locationService.getCountries();
    return res.status(200).json({
      success: true,
      count: countries.length,
      data: countries,
    });
  } catch (error) {
    next(error);
  }
};

const listStates = (req, res, next) => {
  try {
    const { search = '', type = '' } = req.query;
    const states = locationService.getStates({ search, type });
    const master = locationService.getMasterData();
    return res.status(200).json({
      success: true,
      metadata: master.metadata,
      count: states.length,
      data: states,
    });
  } catch (error) {
    next(error);
  }
};

const listDistrictsByState = (req, res, next) => {
  try {
    const { stateId } = req.params;
    const { search = '' } = req.query;
    const districts = locationService.getDistrictsByState(stateId, { search });
    if (!districts) {
      return res.status(404).json({
        success: false,
        message: `State or UT '${stateId}' not found in the India Location Master.`,
      });
    }
    return res.status(200).json({
      success: true,
      count: districts.length,
      data: districts,
    });
  } catch (error) {
    next(error);
  }
};

const listCitiesByState = (req, res, next) => {
  try {
    const { stateId } = req.params;
    const { district = '', search = '' } = req.query;
    const cities = locationService.getCitiesByState(stateId, { district, search });
    if (!cities) {
      return res.status(404).json({
        success: false,
        message: `State or UT '${stateId}' not found in the India Location Master.`,
      });
    }
    return res.status(200).json({
      success: true,
      count: cities.length,
      data: cities,
    });
  } catch (error) {
    next(error);
  }
};

const listLocalitiesByCity = (req, res, next) => {
  try {
    const { cityId } = req.params;
    const { state = '', search = '', page = 1, limit = 100 } = req.query;
    const result = locationService.getLocalitiesByCity(cityId, { state, search, page, limit });
    if (!result) {
      return res.status(404).json({
        success: false,
        message: `City '${cityId}' not found in the India Location Master.`,
      });
    }
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const searchAllLocations = (req, res, next) => {
  try {
    const { q = '', state = '', mlOnly = 'false', page = 1, limit = 25 } = req.query;
    const result = locationService.searchLocations({
      q,
      state,
      mlOnly: mlOnly === 'true',
      page,
      limit,
    });
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listCountries,
  listStates,
  listDistrictsByState,
  listCitiesByState,
  listLocalitiesByCity,
  searchAllLocations,
};
