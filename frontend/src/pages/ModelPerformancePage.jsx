import React, { useState, useEffect, useCallback } from 'react';
import {
  Cpu,
  CheckCircle2,
  Database,
  MapPin,
  BarChart3,
  ShieldAlert,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ScatterChart,
  Scatter,
  Legend,
} from 'recharts';
import api from '../services/api';
import StatCard from '../components/StatCard';
import SkeletonLoader from '../components/SkeletonLoader';
import ErrorState from '../components/ErrorState';
import { formatINR, formatNumberIN, formatDateTime } from '../utils/formatters';

const ModelPerformancePage = () => {
  const [modelData, setModelData] = useState(null);
  const [serviceOnline, setServiceOnline] = useState(false);
  const [selectedStateFilter, setSelectedStateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchModelAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/model/info');
      if (res.data?.success) {
        setModelData(res.data.data);
        setServiceOnline(Boolean(res.data.serviceOnline));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to fetch ML model evaluation metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModelAnalytics();
  }, [fetchModelAnalytics]);

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader type="stats" />
        <SkeletonLoader rows={4} />
      </div>
    );
  }

  if (error || !modelData) {
    return <ErrorState title="Model Metrics Unavailable" message={error} onRetry={fetchModelAnalytics} />;
  }

  const {
    modelName,
    algorithm,
    modelVersion,
    trainingDate,
    metrics = {},
    datasetInfo = {},
    algorithmComparison = [],
    featureImportance = [],
    actualVsPredicted = [],
    supportedLocations = {},
  } = modelData;

  const stateToCities = supportedLocations.stateToCities || {};
  const coveredStatesList = supportedLocations.states || [];

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="bg-[#0F172A] text-white rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/20 text-xs font-semibold">
              Scikit-learn Regression Benchmark
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                serviceOnline
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/20'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-400/20'
              }`}
            >
              Python Flask Service: {serviceOnline ? 'Online (Port 8000)' : 'Artifact Cached'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{modelName}</h2>
          <p className="text-sm text-slate-300">
            Selected Active Algorithm: <strong className="text-blue-400">{algorithm}</strong> •
            Version <strong className="text-white">v{modelVersion}</strong> • Trained on{' '}
            {formatDateTime(trainingDate)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs shrink-0">
          <div>
            <span className="text-slate-400 block">Training Records (80%)</span>
            <span className="text-lg font-extrabold text-white">
              {formatNumberIN(datasetInfo.trainingRecords)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Testing Records (20%)</span>
            <span className="text-lg font-extrabold text-blue-400">
              {formatNumberIN(datasetInfo.testingRecords)}
            </span>
          </div>
        </div>
      </div>

      {/* EVALUATION CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Test R² Score"
          value={metrics.r2Score ?? 'N/A'}
          subtitle={`3-Fold CV R² Mean: ${metrics.cvR2Mean ?? 'N/A'}`}
          icon={Cpu}
          accent="blue"
        />
        <StatCard
          title="Mean Absolute Error (MAE)"
          value={formatINR(metrics.mae)}
          subtitle="Average absolute prediction deviation"
          icon={BarChart3}
          accent="emerald"
        />
        <StatCard
          title="Root Mean Squared Error"
          value={formatINR(metrics.rmse)}
          subtitle="Test set RMSE metric"
          icon={Layers}
          accent="purple"
        />
        <StatCard
          title="ML Covered Cities"
          value={`${supportedLocations.coveredCitiesCount || 0} / ${supportedLocations.totalCitiesInDatabase || 150}`}
          subtitle={`${supportedLocations.coveredLocalitiesCount || 0} Verified Localities`}
          icon={MapPin}
          accent="amber"
        />
      </div>

      {/* CHARTS ROW 1: ALGORITHM COMPARISON & FEATURE IMPORTANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Algorithm Comparison Chart */}
        <div className="card-surface p-6">
          <h3 className="text-base font-bold text-[#0F172A] mb-1">
            1. Regression Algorithm Comparison (R² Score)
          </h3>
          <p className="text-xs text-[#64748B] mb-5">
            Test R² vs Cross-Validation R² across Linear Regression, Random Forest, and Gradient Boosting
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={algorithmComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="algorithm" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="r2Score" name="Test R² Score" fill="#2563EB" radius={[6, 6, 0, 0]} />
                <Bar dataKey="cvR2Mean" name="CV R² Mean" fill="#6D4AFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Feature Importance Chart */}
        <div className="card-surface p-6">
          <h3 className="text-base font-bold text-[#0F172A] mb-1">
            2. Aggregated Feature Importance (%)
          </h3>
          <p className="text-xs text-[#64748B] mb-5">
            Relative contribution of structural and location features in {algorithm}
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportance.slice(0, 8)} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" unit="%" tick={{ fontSize: 11 }} />
                <YAxis dataKey="label" type="category" width={140} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val) => `${val}%`} />
                <Bar dataKey="percentage" name="Importance %" fill="#10B981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CHART ROW 2: ACTUAL VS PREDICTED SCATTER PLOT & BENCHMARK TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 card-surface p-6">
          <h3 className="text-base font-bold text-[#0F172A] mb-1">
            3. Actual vs. Predicted Property Value (₹ Lakhs)
          </h3>
          <p className="text-xs text-[#64748B] mb-5">
            Stratified test set sample comparing actual benchmark prices against model predictions
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  type="number"
                  dataKey="actualLakhs"
                  name="Actual Price"
                  unit="L"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="predictedLakhs"
                  name="Predicted Price"
                  unit="L"
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value) => `₹${value} Lakhs`}
                />
                <Scatter name="Test Set Properties" data={actualVsPredicted} fill="#2563EB" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 card-surface p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0F172A] mb-1">
              4. Algorithm Benchmark Table
            </h3>
            <p className="text-xs text-[#64748B] mb-4">
              Exact evaluation metrics recorded during training pipeline execution
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[#64748B] uppercase">
                    <th className="py-2.5">Algorithm</th>
                    <th className="py-2.5">Test R²</th>
                    <th className="py-2.5">MAE</th>
                    <th className="py-2.5">RMSE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {algorithmComparison.map((row) => (
                    <tr
                      key={row.algorithm}
                      className={row.algorithm === algorithm ? 'bg-blue-50/60 font-bold' : ''}
                    >
                      <td className="py-3 pr-2 text-[#0F172A]">
                        {row.algorithm}
                        {row.algorithm === algorithm && (
                          <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-[#2563EB] text-white">
                            Selected
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-[#10B981] font-semibold">{row.r2Score}</td>
                      <td className="py-3">{formatINR(row.mae)}</td>
                      <td className="py-3">{formatINR(row.rmse)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="font-bold text-[#0F172A] flex items-center gap-1.5">
              <Database className="w-4 h-4 text-[#2563EB]" />
              Dataset Cleaning Summary
            </div>
            <p className="text-[#64748B]">
              Raw Records: <strong>{datasetInfo.rawRecords}</strong> • Cleaned Records:{' '}
              <strong>{datasetInfo.datasetRecords}</strong> • Duplicates Removed:{' '}
              <strong>{datasetInfo.cleaningReport?.duplicatesRemoved ?? 0}</strong> • Outliers
              Filtered: <strong>{datasetInfo.cleaningReport?.outliersRemoved ?? 0}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* SUPPORTED LOCATION COVERAGE DIRECTORY */}
      <div className="card-surface p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">
              Verified ML Training Coverage Directory ({supportedLocations.coveredCitiesCount} Cities)
            </h3>
            <p className="text-xs text-[#64748B]">
              While all 36 Indian States/UTs and 150 cities are selectable in the Location Database,
              these {supportedLocations.coveredCitiesCount} urban centers have verified ML training
              coverage.
            </p>
          </div>
          <select
            value={selectedStateFilter}
            onChange={(e) => setSelectedStateFilter(e.target.value)}
            className="input-field sm:w-64 text-xs py-2"
          >
            <option value="">All Covered States & UTs ({coveredStatesList.length})</option>
            {coveredStatesList.map((st) => (
              <option key={st} value={st}>
                {st} ({stateToCities[st]?.length || 0} cities)
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-1">
          {coveredStatesList
            .filter((st) => !selectedStateFilter || st === selectedStateFilter)
            .map((st) => (
              <div key={st} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-xs font-bold text-[#0F172A] mb-2 flex items-center justify-between">
                  <span>{st}</span>
                  <span className="text-[11px] text-[#10B981] bg-emerald-50 px-2 py-0.5 rounded-md">
                    {stateToCities[st]?.length || 0} Covered Cities
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(stateToCities[st] || []).map((city) => (
                    <span
                      key={city}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[#1E293B]"
                    >
                      <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                      {city}
                    </span>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* SYNTHETIC DATASET DISCLAIMER */}
      <div className="card-surface p-5 bg-amber-50/70 border-amber-200 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong className="font-bold block mb-0.5">
            Synthetic Benchmark Dataset Provenance Disclosure:
          </strong>
          {datasetInfo.disclaimer}
        </div>
      </div>
    </div>
  );
};

export default ModelPerformancePage;
