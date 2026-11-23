import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, accent = 'blue' }) => {
  const accentClasses = {
    blue: 'bg-blue-50 text-[#2563EB]',
    purple: 'bg-purple-50 text-[#6D4AFF]',
    emerald: 'bg-emerald-50 text-[#10B981]',
    amber: 'bg-amber-50 text-[#F59E0B]',
    navy: 'bg-slate-100 text-[#0F172A]',
  };

  return (
    <div className="card-surface p-6 hover:shadow-card-hover transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-2">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-[#64748B] mt-2 font-medium">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${accentClasses[accent] || accentClasses.blue}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
