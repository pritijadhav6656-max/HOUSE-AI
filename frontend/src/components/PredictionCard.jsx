import React from 'react';
import { MapPin, Building2, Calendar, Download, Trash2, Eye } from 'lucide-react';
import { formatINR, formatCompactINR, formatDateShort } from '../utils/formatters';

const PredictionCard = ({ prediction, onView, onDownload, onDelete }) => {
  const isCovered = prediction.predictionStatus === 'completed' && prediction.predictedPrice !== null;

  return (
    <div className="card-surface p-5 hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between gap-4">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-lg">
              <Building2 className="w-3.5 h-3.5" />
              {prediction.bhk} BHK {prediction.propertyType}
            </span>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
              isCovered
                ? 'bg-emerald-50 text-[#10B981]'
                : 'bg-amber-50 text-[#F59E0B]'
            }`}
          >
            {isCovered ? 'ML Verified' : 'Coverage Notice'}
          </span>
        </div>

        <div className="mb-3">
          <div className="text-2xl font-extrabold text-[#0F172A]">
            {isCovered ? formatINR(prediction.predictedPrice) : 'Unsupported Coverage'}
          </div>
          <div className="text-xs font-semibold text-[#64748B] mt-0.5">
            {isCovered
              ? `${formatCompactINR(prediction.predictedPrice)} • ${formatINR(prediction.pricePerSqFt)} / sq.ft.`
              : 'Training data unavailable for selected city'}
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-[#64748B] border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2 text-[#1E293B] font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
            <span className="truncate">
              {prediction.locality}, {prediction.city}, {prediction.state}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>{prediction.area} sq.ft. • {prediction.bathrooms} Bath • {prediction.houseAge} Yrs</span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDateShort(prediction.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
        {onView && (
          <button
            type="button"
            onClick={() => onView(prediction)}
            className="btn-secondary text-xs py-1.5 px-3 flex-1"
          >
            <Eye className="w-3.5 h-3.5" />
            Details
          </button>
        )}
        {onDownload && (
          <button
            type="button"
            onClick={() => onDownload(prediction)}
            className="btn-secondary text-xs py-1.5 px-3"
            title="Download Report"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(prediction)}
            className="p-2 rounded-xl text-slate-400 hover:text-[#EF4444] hover:bg-red-50 transition-colors"
            title="Delete Prediction"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default PredictionCard;
