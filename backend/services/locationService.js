const fs = require('fs');
const path = require('path');

let cachedMaster = null;

const getMasterData = () => {
  if (cachedMaster) return cachedMaster;
  const filePath = path.join(__dirname, '..', 'config', 'india_locations.json');
  if (!fs.existsSync(filePath)) {
    throw new Error('India location master dataset not found at backend/config/india_locations.json');
  }
  cachedMaster = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return cachedMaster;
};

const getCountries = () => {
  const master = getMasterData();
  return [
    {
      country: 'India',
      code: 'IN',
      totalStates: master.metadata.totalStates,
      totalUnionTerritories: master.metadata.totalUnionTerritories,
      totalDistricts: master.metadata.totalDistricts,
      totalCities: master.metadata.totalCities,
      totalLocalities: master.metadata.totalLocalities,
    },
  ];
};

const getStates = ({ search = '', type = '' } = {}) => {
  const master = getMasterData();
  const q = search.trim().toLowerCase();

  return master.statesAndUTs
    .filter((s) => {
      if (type && s.type.toLowerCase() !== type.toLowerCase()) return false;
      if (q && !s.state.toLowerCase().includes(q) && !s.stateCode.toLowerCase().includes(q)) return false;
      return true;
    })
    .map((s) => {
      const citiesCount = s.districts.reduce((acc, d) => acc + d.cities.length, 0);
      const mlCitiesCount = s.districts.reduce(
        (acc, d) => acc + d.cities.filter((c) => c.mlCovered).length,
        0
      );
      return {
        state: s.state,
        stateCode: s.stateCode,
        type: s.type,
        districtsCount: s.districts.length,
        citiesCount,
        mlCoveredCitiesCount: mlCitiesCount,
        hasMlCoverage: mlCitiesCount > 0,
      };
    })
    .sort((a, b) => a.state.localeCompare(b.state));
};

const findStateEntry = (stateIdentifier) => {
  const master = getMasterData();
  const norm = decodeURIComponent(String(stateIdentifier || '')).trim().toLowerCase();
  return master.statesAndUTs.find(
    (s) => s.state.toLowerCase() === norm || s.stateCode.toLowerCase() === norm
  );
};

const getDistrictsByState = (stateIdentifier, { search = '' } = {}) => {
  const stateObj = findStateEntry(stateIdentifier);
  if (!stateObj) return null;
  const q = search.trim().toLowerCase();

  return stateObj.districts
    .filter((d) => !q || d.district.toLowerCase().includes(q))
    .map((d) => ({
      district: d.district,
      districtCode: d.districtCode,
      state: stateObj.state,
      stateCode: stateObj.stateCode,
      citiesCount: d.cities.length,
    }))
    .sort((a, b) => a.district.localeCompare(b.district));
};

const getCitiesByState = (stateIdentifier, { district = '', search = '' } = {}) => {
  const stateObj = findStateEntry(stateIdentifier);
  if (!stateObj) return null;
  const q = search.trim().toLowerCase();
  const distNorm = district.trim().toLowerCase();

  const cities = [];
  for (const d of stateObj.districts) {
    if (distNorm && d.district.toLowerCase() !== distNorm && d.districtCode.toLowerCase() !== distNorm) {
      continue;
    }
    for (const c of d.cities) {
      if (q && !c.city.toLowerCase().includes(q)) continue;
      cities.push({
        city: c.city,
        cityCode: c.cityCode,
        district: d.district,
        districtCode: d.districtCode,
        state: stateObj.state,
        stateCode: stateObj.stateCode,
        mlCovered: Boolean(c.mlCovered),
        localitiesCount: c.localities.length,
      });
    }
  }
  return cities.sort((a, b) => a.city.localeCompare(b.city));
};

const getLocalitiesByCity = (cityIdentifier, { state = '', search = '', page = 1, limit = 100 } = {}) => {
  const master = getMasterData();
  const norm = decodeURIComponent(String(cityIdentifier || '')).trim().toLowerCase();
  const stateNorm = state.trim().toLowerCase();
  const q = search.trim().toLowerCase();

  let matchedCity = null;
  let matchedDistrict = null;
  let matchedState = null;

  for (const s of master.statesAndUTs) {
    if (stateNorm && s.state.toLowerCase() !== stateNorm && s.stateCode.toLowerCase() !== stateNorm) {
      continue;
    }
    for (const d of s.districts) {
      for (const c of d.cities) {
        if (c.city.toLowerCase() === norm || c.cityCode.toLowerCase() === norm) {
          matchedCity = c;
          matchedDistrict = d;
          matchedState = s;
          break;
        }
      }
      if (matchedCity) break;
    }
    if (matchedCity) break;
  }

  if (!matchedCity) return null;

  const filtered = matchedCity.localities
    .filter((loc) => !q || loc.toLowerCase().includes(q))
    .sort((a, b) => a.localeCompare(b))
    .map((loc, idx) => ({
      id: `${matchedCity.cityCode}-LOC-${idx + 1}`,
      locality: loc,
      city: matchedCity.city,
      cityCode: matchedCity.cityCode,
      district: matchedDistrict.district,
      state: matchedState.state,
      stateCode: matchedState.stateCode,
      mlCovered: Boolean(matchedCity.mlCovered),
    }));

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(200, parseInt(limit, 10) || 100));
  const start = (pageNum - 1) * limitNum;

  return {
    city: matchedCity.city,
    cityCode: matchedCity.cityCode,
    district: matchedDistrict.district,
    state: matchedState.state,
    mlCovered: Boolean(matchedCity.mlCovered),
    total: filtered.length,
    page: pageNum,
    pages: Math.ceil(filtered.length / limitNum) || 1,
    localities: filtered.slice(start, start + limitNum),
  };
};

const searchLocations = ({ q = '', state = '', mlOnly = false, page = 1, limit = 25 } = {}) => {
  const master = getMasterData();
  const query = q.trim().toLowerCase();
  const stateFilter = state.trim().toLowerCase();

  const matches = master.flatLocations.filter((item) => {
    if (mlOnly && !item.mlCovered) return false;
    if (stateFilter && item.state.toLowerCase() !== stateFilter && item.stateCode.toLowerCase() !== stateFilter) {
      return false;
    }
    if (!query) return true;
    return (
      item.locality.toLowerCase().includes(query) ||
      item.city.toLowerCase().includes(query) ||
      item.district.toLowerCase().includes(query) ||
      item.state.toLowerCase().includes(query)
    );
  });

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 25));
  const start = (pageNum - 1) * limitNum;

  return {
    metadata: master.metadata,
    total: matches.length,
    page: pageNum,
    pages: Math.ceil(matches.length / limitNum) || 1,
    results: matches.slice(start, start + limitNum),
  };
};

module.exports = {
  getMasterData,
  getCountries,
  getStates,
  getDistrictsByState,
  getCitiesByState,
  getLocalitiesByCity,
  searchLocations,
};
