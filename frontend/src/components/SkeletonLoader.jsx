import React from 'react';

const SkeletonLoader = ({ rows = 3, type = 'card' }) => {
  if (type === 'stats') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="card-surface p-6 animate-pulse">
            <div className="h-4 w-28 bg-slate-200 rounded mb-4" />
            <div className="h-8 w-36 bg-slate-200 rounded mb-2" />
            <div className="h-3 w-24 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="card-surface p-5 animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 w-1/3 bg-slate-200 rounded" />
            <div className="h-4 w-20 bg-slate-200 rounded" />
          </div>
          <div className="h-3 w-2/3 bg-slate-100 rounded mb-2" />
          <div className="h-3 w-1/2 bg-slate-100 rounded" />
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
