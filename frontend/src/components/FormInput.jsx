import React from 'react';

const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  min,
  max,
  step,
  disabled = false,
  helperText,
  icon: Icon,
}) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-xs font-semibold uppercase tracking-wider text-[#1E293B] mb-1.5">
          {label} {required && <span className="text-[#EF4444]">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={`input-field ${Icon ? 'pl-10' : ''} ${
            error ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20' : ''
          }`}
        />
      </div>
      {error && <p className="mt-1 text-xs font-medium text-[#EF4444]">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-[#64748B]">{helperText}</p>}
    </div>
  );
};

export default FormInput;
