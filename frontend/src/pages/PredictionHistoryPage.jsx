import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  RotateCcw,
  Calculator,
  History,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useDebounce } from '../hooks/useDebounce';
import PredictionCard from '../components/PredictionCard';
import Pagination from '../components/Pagination';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { downloadPredictionReport } from '../utils/reportGenerator';

const PredictionHistoryPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [predictions, setPredictions] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [citySearch, setCitySearch] = useState('');
  const [localitySearch, setLocalitySearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [bhkFilter, setBhkFilter] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedCity = useDebounce(citySearch, 300);
  const debouncedLocality = useDebounce(localitySearch, 300);

  useEffect(() => {
    api
      .get('/locations/states')
      .then((res) => {
        if (res.data?.success) setStatesList(res.data.data || []);
      })
      .catch(() => {});
  }, []);

  const fetchPredictions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let minPrice = '';
      let maxPrice = '';
      if (priceRange === 'under_50l') {
        maxPrice = 5000000;
      } else if (priceRange === '50l_1cr') {
        minPrice = 5000000;
        maxPrice = 10000000;
      } else if (priceRange === '1cr_2cr') {
        minPrice = 10000000;
        maxPrice = 20000000;
      } else if (priceRange === 'above_2cr') {
        minPrice = 20000000;
      }

      const params = {
        page,
        limit: 9,
        sort: sortBy,
      };
      if (debouncedCity.trim()) params.city = debouncedCity.trim();
      if (debouncedLocality.trim()) params.locality = debouncedLocality.trim();
      if (stateFilter) params.state = stateFilter;
      if (bhkFilter) params.bhk = bhkFilter;
      if (minPrice !== '') params.minPrice = minPrice;
      if (maxPrice !== '') params.maxPrice = maxPrice;

      const res = await api.get('/predictions', { params });
      if (res.data?.success) {
        setPredictions(res.data.data || []);
        setTotal(res.data.total || 0);
        setPages(res.data.pages || 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load prediction history.');
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, debouncedCity, debouncedLocality, stateFilter, bhkFilter, priceRange]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  const handleResetFilters = () => {
    setCitySearch('');
    setLocalitySearch('');
    setStateFilter('');
    setBhkFilter('');
    setPriceRange('');
    setSortBy('newest');
    setPage(1);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/predictions/${deleteTarget._id}`);
      if (res.data?.success) {
        showToast('Prediction record deleted.', 'success');
        setDeleteTarget(null);
        fetchPredictions();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to delete record.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#0F172A]">Prediction History</h2>
          <p className="text-sm text-[#64748B]">
            Search, filter, sort, and export your stored residential property price estimations
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/predict')}
          className="btn-primary text-sm"
        >
          <Calculator className="w-4 h-4" />
          New Prediction
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="card-surface p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0F172A]">
            <Filter className="w-4 h-4 text-[#2563EB]" />
            <span>MongoDB Query Filters & Sorting</span>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs font-semibold text-[#64748B] hover:text-[#0F172A] inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={citySearch}
              onChange={(e) => {
                setCitySearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by city..."
              className="input-field pl-9 text-xs py-2"
            />
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localitySearch}
              onChange={(e) => {
                setLocalitySearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by locality..."
              className="input-field pl-9 text-xs py-2"
            />
          </div>

          <select
            value={stateFilter}
            onChange={(e) => {
              setStateFilter(e.target.value);
              setPage(1);
            }}
            className="input-field text-xs py-2"
          >
            <option value="">All States & UTs</option>
            {statesList.map((s) => (
              <option key={s.stateCode} value={s.state}>
                {s.state}
              </option>
            ))}
          </select>

          <select
            value={bhkFilter}
            onChange={(e) => {
              setBhkFilter(e.target.value);
              setPage(1);
            }}
            className="input-field text-xs py-2"
          >
            <option value="">All BHK Configs</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4 BHK</option>
            <option value="5">5+ BHK</option>
          </select>

          <select
            value={priceRange}
            onChange={(e) => {
              setPriceRange(e.target.value);
              setPage(1);
            }}
            className="input-field text-xs py-2"
          >
            <option value="">All Price Ranges</option>
            <option value="under_50l">Under ₹50 Lakhs</option>
            <option value="50l_1cr">₹50 Lakhs - ₹1 Crore</option>
            <option value="1cr_2cr">₹1 Crore - ₹2 Crores</option>
            <option value="above_2cr">Above ₹2 Crores</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="input-field text-xs py-2 font-semibold"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="price_desc">Sort: Highest Price</option>
            <option value="price_asc">Sort: Lowest Price</option>
          </select>
        </div>
      </div>

      {/* RESULTS */}
      {loading ? (
        <SkeletonLoader rows={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchPredictions} />
      ) : predictions.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Matching Predictions Found"
          description="Try clearing your search filters or run a new property price estimation."
          actionLabel="Predict Property Price"
          onAction={() => navigate('/predict')}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {predictions.map((pred) => (
              <PredictionCard
                key={pred._id}
                prediction={pred}
                onView={(p) => navigate(`/prediction-result/${p._id}`, { state: { prediction: p } })}
                onDownload={(p) => {
                  downloadPredictionReport(p);
                  showToast('Valuation report downloaded.', 'success');
                }}
                onDelete={(p) => setDeleteTarget(p)}
              />
            ))}
          </div>

          <Pagination
            page={page}
            pages={pages}
            total={total}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </>
      )}

      <ConfirmationDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete Prediction Record"
        message={
          deleteTarget
            ? `Are you sure you want to permanently delete your prediction for ${deleteTarget.bhk} BHK in ${deleteTarget.locality}, ${deleteTarget.city}?`
            : ''
        }
        confirmLabel="Delete Record"
      />
    </div>
  );
};

export default PredictionHistoryPage;
