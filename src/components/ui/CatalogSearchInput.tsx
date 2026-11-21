import React from 'react';
import { Search, X } from 'lucide-react';

export interface CatalogSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  variant?: 'default' | 'dark-surface';
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Unified search input with leading search icon and one-click clear button.
 */
export const CatalogSearchInput: React.FC<CatalogSearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  ariaLabel,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const inputSizing =
    size === 'sm' ? 'py-1.5 pl-8 pr-7 text-xs' : 'py-2.5 pl-9 pr-8 text-sm';

  const surfaceClass =
    variant === 'dark-surface'
      ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-sky-500'
      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500';

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5 left-2.5' : 'w-4 h-4 left-3';

  return (
    <div className={`relative ${className}`}>
      <Search
        className={`absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none ${iconSize}`}
        aria-hidden="true"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className={`w-full rounded-lg border outline-none transition-colors ${inputSizing} ${surfaceClass}`}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
