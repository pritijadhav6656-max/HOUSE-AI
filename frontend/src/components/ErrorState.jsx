import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorState = ({
  title = 'Unable to load data',
  message = 'An error occurred while communicating with the server.',
  onRetry,
}) => {
  return (
    <div className="card-surface p-8 text-center border-red-200 bg-red-50/40 flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#EF4444] flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-[#0F172A] mb-1">{title}</h3>
      <p className="text-sm text-[#64748B] max-w-md mb-5">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-sm">
          <RefreshCw className="w-4 h-4" />
          Retry Request
        </button>
      )}
    </div>
  );
};

export default ErrorState;
