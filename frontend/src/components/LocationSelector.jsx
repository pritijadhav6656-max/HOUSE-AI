import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle2, AlertTriangle, Globe } from 'lucide-react';
import api from '../services/api';
import SearchableSelect from './SearchableSelect';

const LocationSelector = ({
  value = {},
  onChange,
  errors = {},
}) => {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [selectedCityMlCovered, setSelectedCityMlCovered] = useState(null);

  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingLocalities, setLoadingLocalities] = useState(false);

  // 1. Load all 28 States + 8 UTs on mount
  useEffect(() => {
    let active = true;
    const fetchStates = async () => {
      setLoadingStates(true);
      try {
        const res = await api.get('/locations/states');
        if (active && res.data?.success) {
          setStates(res.data.data || []);
        }
      } catch {
        // Handled gracefully
      } finally {
        if (active) setLoadingStates(false);
      }
    };
    fetchStates();
    return () => {
      active = false;
    };
  }, []);

  // 2. When state changes, load districts and cities for that state
  useEffect(() => {
    if (!value.state) {
      setDistricts([]);
      setCities([]);
      setLocalities([]);
      setSelectedCityMlCovered(null);
      return;
    }

    let active = true;
    const fetchStateHierarchy = async () => {
      setLoadingDistricts(true);
      setLoadingCities(true);
      try {
        const [distRes, cityRes] = await Promise.all([
          api.get(`/locations/states/${encodeURIComponent(value.state)}/districts`),
          api.get(`/locations/states/${encodeURIComponent(value.state)}/cities`),
        ]);
        if (active) {
          setDistricts(distRes.data?.data || []);
          setCities(cityRes.data?.data || []);
        }
      } catch {
        if (active) {
          setDistricts([]);
          setCities([]);
        }
      } finally {
        if (active) {
          setLoadingDistricts(false);
          setLoadingCities(false);
        }
      }
    };
    fetchStateHierarchy();
    return () => {
      active = false;
    };
  }, [value.state]);

  // 3. Filter cities when district changes
  useEffect(() => {
    if (!value.state) return;
    let active = true;
    const fetchCitiesForDistrict = async () => {
      setLoadingCities(true);
      try {
        const query = value.district ? `?district=${encodeURIComponent(value.district)}` : '';
        const res = await api.get(
          `/locations/states/${encodeURIComponent(value.state)}/cities${query}`
        );
        if (active && res.data?.success) {
          setCities(res.data.data || []);
        }
      } catch {
        // Ignore
      } finally {
        if (active) setLoadingCities(false);
      }
    };
    fetchCitiesForDistrict();
    return () => {
      active = false;
    };
  }, [value.state, value.district]);

  // 4. When city changes, fetch localities
  useEffect(() => {
    if (!value.city) {
      setLocalities([]);
      setSelectedCityMlCovered(null);
      return;
    }

    let active = true;
    const fetchLocalities = async () => {
      setLoadingLocalities(true);
      try {
        const stateParam = value.state ? `?state=${encodeURIComponent(value.state)}` : '';
        const res = await api.get(
          `/locations/cities/${encodeURIComponent(value.city)}/localities${stateParam}`
        );
        if (active && res.data?.success) {
          setLocalities(res.data.localities || []);
          setSelectedCityMlCovered(Boolean(res.data.mlCovered));
        }
      } catch {
        if (active) {
          setLocalities([]);
          setSelectedCityMlCovered(null);
        }
      } finally {
        if (active) setLoadingLocalities(false);
      }
    };
    fetchLocalities();
    return () => {
      active = false;
    };
  }, [value.city, value.state]);

  const handleStateChange = (newState) => {
    onChange({
      country: 'India',
      state: newState,
      district: '',
      city: '',
      locality: '',
    });
  };

  const handleDistrictChange = (newDistrict) => {
    onChange({
      ...value,
      country: 'India',
      district: newDistrict,
      city: '',
      locality: '',
    });
  };

  const handleCityChange = (newCity, rawOption) => {
    const inferredDistrict = rawOption?.district || value.district || '';
    onChange({
      ...value,
      country: 'India',
      district: inferredDistrict,
      city: newCity,
      locality: '',
    });
  };

  const handleLocalityChange = (newLocality) => {
    onChange({
      ...value,
      country: 'India',
      locality: newLocality,
    });
  };

  const stateOptions = states.map((s) => ({
    value: s.state,
    label: s.state,
    sublabel: s.type,
    badge: `${s.citiesCount} Cities`,
    badgeType: s.hasMlCoverage ? 'success' : 'neutral',
  }));

  const districtOptions = districts.map((d) => ({
    value: d.district,
    label: d.district,
    badge: `${d.citiesCount} Cities`,
  }));

  const cityOptions = cities.map((c) => ({
    value: c.city,
    label: c.city,
    sublabel: c.district,
    district: c.district,
    badge: c.mlCovered ? 'ML Covered' : 'DB Only',
    badgeType: c.mlCovered ? 'success' : 'neutral',
  }));

  const localityOptions = localities.map((l) => ({
    value: l.locality,
    label: l.locality,
    badge: l.mlCovered ? 'Verified' : 'Listed',
    badgeType: l.mlCovered ? 'success' : 'neutral',
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#1E293B] mb-1.5">
            Country
          </label>
          <div className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-[#0F172A] flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#2563EB]" />
            India (IN)
          </div>
        </div>

        <SearchableSelect
          label="State / Union Territory"
          required
          options={stateOptions}
          value={value.state || ''}
          onChange={handleStateChange}
          placeholder={loadingStates ? 'Loading 36 States/UTs...' : 'Select State / UT'}
          searchPlaceholder="Search 28 States & 8 UTs..."
          error={errors.state}
        />

        <SearchableSelect
          label="District"
          options={districtOptions}
          value={value.district || ''}
          onChange={handleDistrictChange}
          disabled={!value.state || loadingDistricts}
          placeholder={
            !value.state
              ? 'Select State first'
              : loadingDistricts
              ? 'Loading districts...'
              : 'All Districts in State'
          }
          searchPlaceholder="Filter districts..."
          error={errors.district}
        />

        <SearchableSelect
          label="City / Town"
          required
          options={cityOptions}
          value={value.city || ''}
          onChange={handleCityChange}
          disabled={!value.state || loadingCities}
          placeholder={
            !value.state
              ? 'Select State first'
              : loadingCities
              ? 'Loading cities...'
              : 'Select City / Town'
          }
          searchPlaceholder="Search city..."
          error={errors.city}
        />

        <SearchableSelect
          label="Locality / Micro-Market"
          required
          options={localityOptions}
          value={value.locality || ''}
          onChange={handleLocalityChange}
          disabled={!value.city || loadingLocalities}
          placeholder={
            !value.city
              ? 'Select City first'
              : loadingLocalities
              ? 'Loading localities...'
              : 'Select Locality'
          }
          searchPlaceholder="Search locality..."
          error={errors.locality}
        />
      </div>

      {value.state && (
        <div
          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
            selectedCityMlCovered === false
              ? 'bg-amber-50/80 border-amber-200 text-amber-900'
              : 'bg-blue-50/60 border-blue-200/80 text-[#1E293B]'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            <MapPin className="w-4 h-4 text-[#2563EB] shrink-0" />
            <span>
              <strong>Selected Location:</strong>{' '}
              {[value.locality, value.city, value.district, value.state, 'India']
                .filter(Boolean)
                .join(' → ')}
            </span>
          </div>
          {value.city && (
            <div className="flex items-center gap-1.5 font-semibold shrink-0">
              {selectedCityMlCovered ? (
                <span className="inline-flex items-center gap-1 text-[#10B981]">
                  <CheckCircle2 className="w-4 h-4" />
                  ML Training Coverage Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[#F59E0B]">
                  <AlertTriangle className="w-4 h-4" />
                  Location in DB (Insufficient ML Training Data)
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
