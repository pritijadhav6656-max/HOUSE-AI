const express = require('express');
const router = express.Router();
const {
  listCountries,
  listStates,
  listDistrictsByState,
  listCitiesByState,
  listLocalitiesByCity,
  searchAllLocations,
} = require('../controllers/locationController');

router.get('/countries', listCountries);
router.get('/states', listStates);
router.get('/states/:stateId/districts', listDistrictsByState);
router.get('/states/:stateId/cities', listCitiesByState);
router.get('/cities/:cityId/localities', listLocalitiesByCity);
router.get('/search', searchAllLocations);

module.exports = router;
