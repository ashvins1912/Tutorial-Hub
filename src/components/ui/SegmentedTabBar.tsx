import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface SegmentedTabItem<T extends string = string> {
  id: T;
  label: string;
  shortLabel?: string;
  count?: number;
  icon?: LucideIcon;
  badge?: string;
}

export interface SegmentedTabBarProps<T extends string = string> {
  // Infer the tab ID union from activeTab, not from arrays widened to string.
  tabs: ReadonlyArray<SegmentedTabItem<NoInfer<T>>>;
  activeTab: T;
  onChange: (tabId: T) => void;
  ariaLabel: string;
  size?: 'xs' | 'sm';
  wrap?: boolean;
  className?: string;
}

/**
 * Reusable accessible segmented tab bar for top-level sub-tabs and inner
 * studio navigation. Guarantees single-line items, consistent dual light/dark
 * contrast, and clean horizontal scrolling or multi-row wrapping when requested.
 */
export function SegmentedTabBar<T extends string>({
  tabs,
  activeTab,
  onChange,
  ariaLabel,
  size = 'sm',
  wrap = false,
  className = '',
}: SegmentedTabBarProps<T>) {
  const buttonPad = size === 'xs' ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-1.5 text-xs';

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`flex items-center gap-1.5 p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 max-w-full ${
        wrap ? 'flex-wrap w-full' : 'w-fit overflow-x-auto no-scrollbar'
      } ${className}`}
    >
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 ${buttonPad} ${
              active
                ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
            {tab.shortLabel ? (
              <>
                <span className="sm:hidden">{tab.shortLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </>
            ) : (
              <span>{tab.label}</span>
            )}
            {typeof tab.count === 'number' && (
              <span
                className={`font-mono tabular-nums text-[10px] ${
                  active
                    ? 'text-slate-300 dark:text-slate-900/80'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                ({tab.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
