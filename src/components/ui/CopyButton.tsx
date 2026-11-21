import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

export interface CopyButtonProps {
  text: string | (() => string);
  label?: string;
  copiedLabel?: string;
  ariaLabel?: string;
  variant?: 'default' | 'subtle' | 'dark-surface';
  size?: 'xs' | 'sm';
  className?: string;
  onCopied?: () => void;
}

/**
 * Reusable clipboard copy button with graceful fallback and 1.8s check confirmation.
 */
export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label = 'Copy',
  copiedLabel = 'Copied',
  ariaLabel,
  variant = 'default',
  size = 'xs',
  className = '',
  onCopied,
}) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    const value = typeof text === 'function' ? text() : text;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      onCopied?.();
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked in restricted context; fail silently
    }
  };

  const sizeClass =
    size === 'sm' ? 'px-3 py-1.5 text-xs gap-1.5' : 'px-2.5 py-1 text-[11px] gap-1';

  const variantClass =
    variant === 'dark-surface'
      ? 'border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200'
      : variant === 'subtle'
        ? 'border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-sky-400 text-slate-700 dark:text-slate-200';

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      aria-label={ariaLabel ?? (copied ? copiedLabel : label)}
      className={`inline-flex items-center rounded-md font-medium transition-colors whitespace-nowrap shrink-0 ${sizeClass} ${variantClass} ${className}`}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-hidden="true" />
      ) : (
        <Copy className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      )}
      <span>{copied ? copiedLabel : label}</span>
    </button>
  );
};
