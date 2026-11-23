import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calculator,
  Building2,
  MapPin,
  Sparkles,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import LocationSelector from '../components/LocationSelector';
import FormInput from '../components/FormInput';
import {
  PROPERTY_TYPES,
  FURNISHING_OPTIONS,
  PARKING_OPTIONS,
} from '../constants/appConstants';

const INITIAL_FORM = {
  country: 'India',
  state: '',
  district: '',
  city: '',
  locality: '',
  propertyType: 'Apartment / Flat',
  area: '1000',
  bhk: '2',
  bathrooms: '2',
  balconies: '1',
  houseAge: '5',
  furnishingStatus: 'Semi-Furnished',
  parking: 'Yes',
  floorNumber: '3',
  totalFloors: '10',
};

const QUICK_PRESETS = [
  {
    label: 'Navi Mumbai • Vashi (2 BHK)',
    state: 'Maharashtra',
    district: 'Thane',
    city: 'Navi Mumbai',
    locality: 'Vashi',
    propertyType: 'Apartment / Flat',
    area: '1000',
    bhk: '2',
    bathrooms: '2',
    balconies: '1',
    houseAge: '5',
    furnishingStatus: 'Semi-Furnished',
    parking: 'Yes',
    floorNumber: '4',
    totalFloors: '12',
  },
  {
    label: 'Bengaluru • Whitefield (3 BHK)',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    city: 'Bengaluru',
    locality: 'Whitefield',
    propertyType: 'Apartment / Flat',
    area: '1550',
    bhk: '3',
    bathrooms: '3',
    balconies: '2',
    houseAge: '3',
    furnishingStatus: 'Fully Furnished',
    parking: 'Yes',
    floorNumber: '8',
    totalFloors: '18',
  },
  {
    label: 'Gurugram • DLF Phase 3 (3 BHK)',
    state: 'Haryana',
    district: 'Gurugram',
    city: 'Gurugram',
    locality: 'DLF Phase 3',
    propertyType: 'Apartment / Flat',
    area: '1800',
    bhk: '3',
    bathrooms: '3',
    balconies: '2',
    houseAge: '4',
    furnishingStatus: 'Semi-Furnished',
    parking: 'Yes',
    floorNumber: '6',
    totalFloors: '15',
  },
];

const PredictPage = () => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLocationChange = (locUpdate) => {
    setFormData((prev) => ({
      ...prev,
      ...locUpdate,
    }));
    setErrors((prev) => ({
      ...prev,
      state: undefined,
      city: undefined,
      locality: undefined,
    }));
  };

  const applyPreset = (preset) => {
    setFormData({
      country: 'India',
      state: preset.state,
      district: preset.district,
      city: preset.city,
      locality: preset.locality,
      propertyType: preset.propertyType,
      area: preset.area,
      bhk: preset.bhk,
      bathrooms: preset.bathrooms,
      balconies: preset.balconies,
      houseAge: preset.houseAge,
      furnishingStatus: preset.furnishingStatus,
      parking: preset.parking,
      floorNumber: preset.floorNumber,
      totalFloors: preset.totalFloors,
    });
    setErrors({});
    showToast(`Loaded preset: ${preset.label}`, 'info');
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.state) errs.state = 'Please select an Indian State or Union Territory.';
    if (!formData.city) errs.city = 'Please select a City or Town.';
    if (!formData.locality) errs.locality = 'Please select a Locality / Area.';

    const areaNum = Number(formData.area);
    if (!formData.area || Number.isNaN(areaNum) || areaNum <= 0 || areaNum > 50000) {
      errs.area = 'Area must be greater than 0 and up to 50,000 sq.ft.';
    }

    const bhkNum = Number(formData.bhk);
    if (!formData.bhk || !Number.isInteger(bhkNum) || bhkNum < 1 || bhkNum > 15) {
      errs.bhk = 'BHK must be a positive whole number (1 - 15).';
    }

    const bathNum = Number(formData.bathrooms);
    if (!formData.bathrooms || !Number.isInteger(bathNum) || bathNum < 1 || bathNum > 15) {
      errs.bathrooms = 'Bathrooms must be a positive whole number (1 - 15).';
    }

    const ageNum = Number(formData.houseAge);
    if (formData.houseAge === '' || Number.isNaN(ageNum) || ageNum < 0 || ageNum > 100) {
      errs.houseAge = 'Property age cannot be negative (0 - 100 years).';
    }

    const floorNum = Number(formData.floorNumber);
    const totalFloorNum = Number(formData.totalFloors);
    if (Number.isNaN(floorNum) || floorNum < 0) {
      errs.floorNumber = 'Floor number cannot be negative.';
    }
    if (Number.isNaN(totalFloorNum) || totalFloorNum < 1) {
      errs.totalFloors = 'Total floors must be at least 1.';
    } else if (floorNum > totalFloorNum) {
      errs.floorNumber = 'Floor number cannot exceed total floors.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!validateForm()) {
      showToast('Please fix the highlighted form errors before submitting.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        country: 'India',
        state: formData.state,
        district: formData.district,
        city: formData.city,
        locality: formData.locality,
        propertyType: formData.propertyType,
        area: Number(formData.area),
        bhk: Number(formData.bhk),
        bathrooms: Number(formData.bathrooms),
        balconies: Number(formData.balconies),
        houseAge: Number(formData.houseAge),
        furnishingStatus: formData.furnishingStatus,
        parking: formData.parking,
        floorNumber: Number(formData.floorNumber),
        totalFloors: Number(formData.totalFloors),
      };

      const res = await api.post('/predictions', payload);
      if (res.data?.success && res.data?.data) {
        if (res.data.coverageSupported) {
          showToast('AI property price prediction completed!', 'success');
        } else {
          showToast('Location recorded — see ML training coverage notice.', 'warning');
        }
        navigate(`/prediction-result/${res.data.data._id}`, {
          state: { prediction: res.data.data },
        });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Prediction request failed. Please ensure Backend and Python ML services are running.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#0F172A]">
            AI Residential Property Price Predictor
          </h2>
          <p className="text-sm text-[#64748B]">
            Select any location across India and enter structural specifications for Scikit-learn
            ML valuation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {QUICK_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(preset)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[#1E293B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors shadow-2xs"
            >
              <Sparkles className="w-3 h-3 inline mr-1 text-[#2563EB]" />
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* STEP 1: LOCATION DETAILS */}
        <div className="card-surface p-6">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">
                1. India-Wide Location Intelligence
              </h3>
              <p className="text-xs text-[#64748B]">
                Cascading hierarchy covering all 28 States and 8 Union Territories
              </p>
            </div>
          </div>

          <LocationSelector
            value={{
              country: formData.country,
              state: formData.state,
              district: formData.district,
              city: formData.city,
              locality: formData.locality,
            }}
            onChange={handleLocationChange}
            errors={errors}
          />
        </div>

        {/* STEP 2: PROPERTY SPECIFICATIONS */}
        <div className="card-surface p-6">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#6D4AFF] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">
                2. Property Specifications & Structural Features
              </h3>
              <p className="text-xs text-[#64748B]">
                All inputs are validated and aligned directly with the active Scikit-learn pipeline
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Property Type */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1E293B] mb-1.5">
                Property Type <span className="text-[#EF4444]">*</span>
              </label>
              <select
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                className="input-field"
              >
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Built-up Area */}
            <FormInput
              label="Built-up Area (sq.ft.)"
              name="area"
              type="number"
              required
              min="100"
              max="50000"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              placeholder="e.g. 1000"
              error={errors.area}
            />

            {/* BHK */}
            <FormInput
              label="BHK Configuration"
              name="bhk"
              type="number"
              required
              min="1"
              max="15"
              value={formData.bhk}
              onChange={(e) => setFormData({ ...formData, bhk: e.target.value })}
              placeholder="e.g. 2"
              error={errors.bhk}
            />

            {/* Bathrooms */}
            <FormInput
              label="Number of Bathrooms"
              name="bathrooms"
              type="number"
              required
              min="1"
              max="15"
              value={formData.bathrooms}
              onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
              placeholder="e.g. 2"
              error={errors.bathrooms}
            />

            {/* Property Age */}
            <FormInput
              label="Property Age (Years)"
              name="houseAge"
              type="number"
              required
              min="0"
              max="100"
              value={formData.houseAge}
              onChange={(e) => setFormData({ ...formData, houseAge: e.target.value })}
              placeholder="e.g. 5"
              error={errors.houseAge}
            />

            {/* Balconies */}
            <FormInput
              label="Number of Balconies"
              name="balconies"
              type="number"
              min="0"
              max="10"
              value={formData.balconies}
              onChange={(e) => setFormData({ ...formData, balconies: e.target.value })}
              placeholder="e.g. 1"
            />

            {/* Furnishing Status */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1E293B] mb-1.5">
                Furnishing Status
              </label>
              <select
                value={formData.furnishingStatus}
                onChange={(e) => setFormData({ ...formData, furnishingStatus: e.target.value })}
                className="input-field"
              >
                {FURNISHING_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Parking Availability */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1E293B] mb-1.5">
                Covered Parking
              </label>
              <select
                value={formData.parking}
                onChange={(e) => setFormData({ ...formData, parking: e.target.value })}
                className="input-field"
              >
                {PARKING_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'Yes' ? 'Yes (Dedicated Parking)' : 'No Parking'}
                  </option>
                ))}
              </select>
            </div>

            {/* Floor Number */}
            <FormInput
              label="Floor Number"
              name="floorNumber"
              type="number"
              min="0"
              max="100"
              value={formData.floorNumber}
              onChange={(e) => setFormData({ ...formData, floorNumber: e.target.value })}
              error={errors.floorNumber}
            />

            {/* Total Floors */}
            <FormInput
              label="Total Building Floors"
              name="totalFloors"
              type="number"
              min="1"
              max="120"
              value={formData.totalFloors}
              onChange={(e) => setFormData({ ...formData, totalFloors: e.target.value })}
              error={errors.totalFloors}
            />
          </div>
        </div>

        {/* DISCLAIMER & ACTIONS */}
        <div className="card-surface p-5 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-2.5 text-xs text-[#64748B]">
            <ShieldAlert className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
            <span>
              Your request will be processed by the Python Flask Scikit-learn service and stored in
              your personal MongoDB prediction history.
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0">
            <button
              type="button"
              onClick={() => {
                setFormData(INITIAL_FORM);
                setErrors({});
              }}
              disabled={submitting}
              className="btn-secondary text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button type="submit" disabled={submitting} className="btn-primary text-sm px-6 py-3">
              <Calculator className="w-4 h-4" />
              {submitting ? 'Running ML Inference...' : 'Generate AI Price Estimate'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PredictPage;
