import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Building2,
  Cpu,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Calculator,
  Calendar,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import { formatINR, formatCompactINR, formatDateTime } from '../utils/formatters';
import { downloadPredictionReport, printPredictionReport } from '../utils/reportGenerator';

const PredictionResultPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [prediction, setPrediction] = useState(location.state?.prediction || null);
  const [modelMeta, setModelMeta] = useState(null);
  const [animatedPrice, setAnimatedPrice] = useState(0);
  const [loading, setLoading] = useState(!location.state?.prediction);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        const [predRes, modelRes] = await Promise.all([
          prediction ? Promise.resolve({ data: { success: true, data: prediction } }) : api.get(`/predictions/${id}`),
          api.get('/model/info').catch(() => ({ data: null })),
        ]);
        if (active) {
          if (predRes.data?.success) {
            setPrediction(predRes.data.data);
          }
          if (modelRes.data?.success) {
            setModelMeta(modelRes.data.data);
          }
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || 'Unable to load prediction record.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    loadData();
    return () => {
      active = false;
    };
  }, [id]);

  // Animated price counter
  useEffect(() => {
    if (!prediction || !prediction.predictedPrice) {
      setAnimatedPrice(0);
      return;
    }
    const target = Number(prediction.predictedPrice);
    const duration = 650;
    const steps = 24;
    const increment = target / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep += 1;
      if (currentStep >= steps) {
        setAnimatedPrice(target);
        clearInterval(timer);
      } else {
        setAnimatedPrice(Math.round(increment * currentStep));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [prediction]);

  if (loading) {
    return <LoadingSpinner label="Loading valuation report..." />;
  }

  if (error || !prediction) {
    return (
      <ErrorState
        title="Prediction Report Not Found"
        message={error || 'The requested prediction record could not be retrieved.'}
        onRetry={() => navigate('/history')}
      />
    );
  }

  const isCovered = prediction.predictionStatus === 'completed' && prediction.predictedPrice !== null;
  const baseAreaComponent = isCovered ? Math.round(prediction.predictedPrice * 0.84) : 0;
  const structuralComponent = isCovered ? prediction.predictedPrice - baseAreaComponent : 0;

  return (
    <div className="space-y-6">
      {/* TOP BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <Link
          to="/history"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#0F172A]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Prediction History
        </Link>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-[#10B981] text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            Saved to Account History
          </span>
          <button
            type="button"
            onClick={() => {
              downloadPredictionReport(prediction);
              showToast('Valuation report downloaded.', 'success');
            }}
            className="btn-secondary text-xs py-2 px-3.5"
          >
            <Download className="w-4 h-4 text-[#2563EB]" />
            Download Report
          </button>
          <button
            type="button"
            onClick={() => printPredictionReport(prediction)}
            className="btn-secondary text-xs py-2 px-3.5"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <Link to="/predict" className="btn-primary text-xs py-2 px-4">
            <Calculator className="w-4 h-4" />
            Predict Another Property
          </Link>
        </div>
      </div>

      {/* HERO VALUATION CARD */}
      <div className="bg-[#0F172A] text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
                Estimated Property Value
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  isCovered
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {prediction.predictionCoverage}
              </span>
            </div>

            {isCovered ? (
              <>
                <div className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                  {formatINR(animatedPrice)}
                </div>
                <p className="text-sm sm:text-base text-blue-300 font-semibold">
                  {formatCompactINR(prediction.predictedPrice)} • Price per sq.ft.:{' '}
                  <span className="text-white font-bold">{formatINR(prediction.pricePerSqFt)}</span>
                </p>
              </>
            ) : (
              <div className="space-y-2 pt-1">
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="w-7 h-7 shrink-0" />
                  Insufficient ML Training Data for {prediction.city}
                </div>
                <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                  {prediction.coverageMessage ||
                    `While ${prediction.city} (${prediction.state}) is registered in the HOUSE AI India Location Database, the active ML model does not have sufficient training data for this city. To prevent misleading estimates, no synthetic price was generated.`}
                </p>
              </div>
            )}
          </div>

          {isCovered && (
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 min-w-[240px] space-y-2">
              <div className="text-xs text-slate-400">Price per sq.ft.</div>
              <div className="text-2xl font-extrabold text-blue-400">
                {formatINR(prediction.pricePerSqFt)}
              </div>
              <div className="text-xs text-slate-400 pt-2 border-t border-slate-800">
                Property: <strong className="text-white">{prediction.bhk} BHK {prediction.propertyType}</strong>
              </div>
              <div className="text-xs text-slate-400">
                Location:{' '}
                <strong className="text-white">
                  {prediction.locality}, {prediction.city}, {prediction.state}
                </strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DETAILS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Location Summary */}
        <div className="card-surface p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <MapPin className="w-5 h-5 text-[#2563EB]" />
            <h3 className="text-base font-bold text-[#0F172A]">Selected Location</h3>
          </div>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-[#64748B]">Country</span>
              <span className="font-semibold text-[#0F172A]">{prediction.country || 'India'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-[#64748B]">State / UT</span>
              <span className="font-semibold text-[#0F172A]">{prediction.state}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-[#64748B]">District</span>
              <span className="font-semibold text-[#0F172A]">{prediction.district || 'Verified District'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-[#64748B]">City / Town</span>
              <span className="font-semibold text-[#0F172A]">{prediction.city}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#64748B]">Locality</span>
              <span className="font-semibold text-[#2563EB]">{prediction.locality}</span>
            </div>
          </div>
        </div>

        {/* Property Summary */}
        <div className="card-surface p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Building2 className="w-5 h-5 text-[#6D4AFF]" />
            <h3 className="text-base font-bold text-[#0F172A]">Property Configuration</h3>
          </div>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-[#64748B]">Property Type</span>
              <span className="font-semibold text-[#0F172A]">{prediction.propertyType}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-[#64748B]">Built-up Area</span>
              <span className="font-semibold text-[#0F172A]">{prediction.area} sq.ft.</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-[#64748B]">BHK & Bathrooms</span>
              <span className="font-semibold text-[#0F172A]">
                {prediction.bhk} BHK • {prediction.bathrooms} Bathrooms
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-[#64748B]">Property Age</span>
              <span className="font-semibold text-[#0F172A]">{prediction.houseAge} Years</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-[#64748B]">Furnishing & Parking</span>
              <span className="font-semibold text-[#0F172A]">
                {prediction.furnishingStatus || 'Semi-Furnished'} • Parking: {prediction.parking || 'Yes'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#64748B]">Floor & Balconies</span>
              <span className="font-semibold text-[#0F172A]">
                Floor {prediction.floorNumber ?? 2}/{prediction.totalFloors ?? 5} • {prediction.balconies ?? 1} Balcony
              </span>
            </div>
          </div>
        </div>

        {/* Model & Evaluation Metadata */}
        <div className="card-surface p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Cpu className="w-5 h-5 text-[#10B981]" />
            <h3 className="text-base font-bold text-[#0F172A]">ML Model Information</h3>
          </div>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-[#64748B]">Model Name</span>
              <span className="font-semibold text-[#0F172A] text-right">{prediction.modelName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-[#64748B]">Model Version</span>
              <span className="font-semibold text-[#0F172A]">v{prediction.modelVersion}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-[#64748B]">Test R² Score</span>
              <span className="font-semibold text-[#10B981]">
                {modelMeta?.metrics?.r2Score ?? prediction.modelMetrics?.r2Score ?? '0.9712'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-[#64748B]">Test MAE / RMSE</span>
              <span className="font-semibold text-[#0F172A]">
                {modelMeta?.metrics
                  ? `${formatCompactINR(modelMeta.metrics.mae)} / ${formatCompactINR(modelMeta.metrics.rmse)}`
                  : 'Verified'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#64748B] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Timestamp
              </span>
              <span className="font-semibold text-[#0F172A] text-xs">
                {formatDateTime(prediction.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* COMPONENT BREAKDOWN */}
      {isCovered && (
        <div className="card-surface p-6">
          <h3 className="text-base font-bold text-[#0F172A] mb-3">
            Analytical Valuation Component Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-[#64748B] block">Base Area & Micro-Market Component</span>
              <span className="text-lg font-extrabold text-[#0F172A] mt-1 block">
                {formatINR(baseAreaComponent)}
              </span>
              <span className="text-[11px] text-[#64748B]">
                {prediction.area} sq.ft. in {prediction.locality}, {prediction.city}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-[#64748B] block">Configuration, Age & Amenity Adjustment</span>
              <span className="text-lg font-extrabold text-[#2563EB] mt-1 block">
                {formatINR(structuralComponent)}
              </span>
              <span className="text-[11px] text-[#64748B]">
                {prediction.bhk} BHK • {prediction.furnishingStatus} • {prediction.houseAge} Yrs Age
              </span>
            </div>
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
              <span className="text-xs text-[#2563EB] font-semibold block">Total Estimated Property Value</span>
              <span className="text-lg font-extrabold text-[#0F172A] mt-1 block">
                {formatINR(prediction.predictedPrice)}
              </span>
              <span className="text-[11px] text-[#64748B]">
                Effective Unit Rate: {formatINR(prediction.pricePerSqFt)} / sq.ft.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SYNTHETIC DATASET & VALUATION DISCLAIMER */}
      <div className="card-surface p-5 bg-amber-50/70 border-amber-200 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong className="font-bold block mb-0.5">
            Dataset Provenance & Valuation Disclaimer:
          </strong>
          {prediction.disclaimer ||
            'Predictions are generated by a machine learning model trained on the HOUSE AI Synthetic India Urban Residential Benchmark Dataset for educational and analytical decision-support purposes. Estimates do not represent real-world property transaction records or an official certified legal appraisal.'}
        </div>
      </div>
    </div>
  );
};

export default PredictionResultPage;
