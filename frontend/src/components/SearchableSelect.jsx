import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

const SearchableSelect = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Type to filter...',
  disabled = false,
  required = false,
  error,
  renderBadge,
  emptyMessage = 'No matching options found.',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizedOptions = useMemo(() => {
    return options.map((opt) =>
      typeof opt === 'string'
        ? { value: opt, label: opt }
        : {
            value: opt.value,
            label: opt.label,
            sublabel: opt.sublabel,
            badge: opt.badge,
            badgeType: opt.badgeType,
            raw: opt,
          }
    );
  }, [options]);

  const filteredOptions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return normalizedOptions;
    return normalizedOptions.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.sublabel && o.sublabel.toLowerCase().includes(q))
    );
  }, [normalizedOptions, searchTerm]);

  const selectedOption = normalizedOptions.find((o) => o.value === value);

  const handleSelect = (opt) => {
    onChange(opt.value, opt.raw || opt);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('', null);
    setSearchTerm('');
  };

  return (
    <div className="w-full relative" ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#1E293B] mb-1.5">
          {label} {required && <span className="text-[#EF4444]">*</span>}
        </label>
      )}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        className={`w-full px-4 py-2.5 rounded-xl border bg-white flex items-center justify-between gap-2 text-left transition-all ${
          disabled
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
            : 'cursor-pointer hover:border-slate-300'
        } ${
          error
            ? 'border-[#EF4444]'
            : isOpen
            ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20'
            : 'border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2 truncate flex-1">
          {selectedOption ? (
            <>
              <span className="text-sm font-medium text-[#1E293B] truncate">
                {selectedOption.label}
              </span>
              {selectedOption.sublabel && (
                <span className="text-xs text-[#64748B] truncate">
                  ({selectedOption.sublabel})
                </span>
              )}
              {renderBadge && renderBadge(selectedOption)}
            </>
          ) : (
            <span className="text-sm text-slate-400 truncate">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {selectedOption && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-150 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-40 mt-1.5 w-full bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-2 border-b border-slate-100 bg-slate-50/70">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                autoFocus
                className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-[#64748B]">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full px-4 py-2.5 text-left flex items-center justify-between gap-2 text-sm transition-colors ${
                      isSelected
                        ? 'bg-blue-50/70 text-[#2563EB] font-semibold'
                        : 'text-[#1E293B] hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-col truncate">
                      <span className="truncate">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="text-xs text-[#64748B]">{opt.sublabel}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {opt.badge && (
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                            opt.badgeType === 'success'
                              ? 'bg-emerald-50 text-[#10B981]'
                              : 'bg-slate-100 text-[#64748B]'
                          }`}
                        >
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && <Check className="w-4 h-4 text-[#2563EB]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
      {error && <p className="mt-1 text-xs font-medium text-[#EF4444]">{error}</p>}
    </div>
  );
};

export default SearchableSelect;
