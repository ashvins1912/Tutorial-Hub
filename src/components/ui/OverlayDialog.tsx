import React, { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

export interface OverlayDialogProps {
  open: boolean;
  onClose: () => void;
  ariaLabel: string;
  maxWidthClass?: string;
  panelClassName?: string;
  backdropClassName?: string;
  closeOnBackdrop?: boolean;
  children: ReactNode;
}

/**
 * Reusable accessible centered modal shell with Escape-key dismissal,
 * backdrop click handling, and consistent dual light/dark framing.
 */
export const OverlayDialog: React.FC<OverlayDialogProps> = ({
  open,
  onClose,
  ariaLabel,
  maxWidthClass = 'max-w-3xl',
  panelClassName = 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl',
  backdropClassName = 'bg-slate-950/60 backdrop-blur-xs',
  closeOnBackdrop = true,
  children,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${backdropClassName}`}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full ${maxWidthClass} max-h-[90vh] overflow-hidden flex flex-col shadow-2xl ${panelClassName}`}
      >
        {children}
      </div>
    </div>
  );
};

export interface SlideOverDrawerProps {
  open: boolean;
  onClose: () => void;
  ariaLabel: string;
  maxWidthClass?: string;
  panelClassName?: string;
  closeOnBackdrop?: boolean;
  children: ReactNode;
}

/**
 * Reusable accessible right-hand slide-over drawer with Escape-key close and
 * backdrop dismissal.
 */
export const SlideOverDrawer: React.FC<SlideOverDrawerProps> = ({
  open,
  onClose,
  ariaLabel,
  maxWidthClass = 'max-w-xl',
  panelClassName = 'bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800',
  closeOnBackdrop = true,
  children,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`w-full ${maxWidthClass} h-full overflow-y-auto ${panelClassName}`}>
        {children}
      </div>
    </div>
  );
};

export interface OverlayHeaderProps {
  kicker?: string;
  title: ReactNode;
  subtitle?: string;
  onClose: () => void;
  closeAriaLabel?: string;
  extraActions?: ReactNode;
  className?: string;
}

export const OverlayHeader: React.FC<OverlayHeaderProps> = ({
  kicker,
  title,
  subtitle,
  onClose,
  closeAriaLabel = 'Close dialog',
  extraActions,
  className = 'px-6 py-4 border-b border-slate-200 dark:border-slate-800',
}) => (
  <div className={`flex items-start justify-between gap-4 shrink-0 ${className}`}>
    <div className="min-w-0">
      {kicker && (
        <p className="text-xs font-mono text-sky-600 dark:text-sky-400 truncate">{kicker}</p>
      )}
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-2">
        {title}
      </h2>
      {subtitle && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
      )}
    </div>
    <div className="flex items-center gap-2 shrink-0">
      {extraActions}
      <button
        type="button"
        onClick={onClose}
        aria-label={closeAriaLabel}
        className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  </div>
);
