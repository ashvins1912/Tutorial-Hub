import React, {
  Component,
  Suspense,
  lazy,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

const CHUNK_RELOAD_STORAGE_KEY = 'patternforge_chunk_reload_ts_v1';
const CHUNK_RELOAD_COOLDOWN_MS = 15_000;

/**
 * Detects stale Vite / ES module dynamic-import chunk errors that happen after
 * a fresh production deployment when a browser tab still holds an older HTML shell.
 */
export function isDynamicImportError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? `${error.name} ${error.message}`
      : typeof error === 'string'
        ? error
        : '';
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError|Loading chunk \d+ failed/i.test(
    message
  );
}

/**
 * Triggers a single guarded full-page reload to fetch the latest index.html &
 * asset manifest after a deployment. Protected by a 15s cooldown in sessionStorage
 * so it can never enter an infinite reload loop.
 */
export function triggerOneShotChunkReload(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const lastTs = Number(window.sessionStorage.getItem(CHUNK_RELOAD_STORAGE_KEY) || '0');
    const now = Date.now();
    if (now - lastTs < CHUNK_RELOAD_COOLDOWN_MS) {
      return false;
    }
    window.sessionStorage.setItem(CHUNK_RELOAD_STORAGE_KEY, String(now));
    window.location.reload();
    return true;
  } catch {
    return false;
  }
}

interface StudioErrorBoundaryProps {
  studioName: string;
  onRetryReset?: () => void;
  children: ReactNode;
}

interface StudioErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
  isChunkError: boolean;
}

class StudioErrorBoundary extends Component<
  StudioErrorBoundaryProps,
  StudioErrorBoundaryState
> {
  state: StudioErrorBoundaryState = {
    hasError: false,
    errorMessage: null,
    isChunkError: false,
  };

  static getDerivedStateFromError(error: Error): StudioErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unexpected rendering error.',
      isChunkError: isDynamicImportError(error),
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error(`[StudioBoundary:${this.props.studioName}]`, error, info.componentStack);
    if (isDynamicImportError(error)) {
      triggerOneShotChunkReload();
    }
  }

  handleRetry = (): void => {
    this.props.onRetryReset?.();
    this.setState({ hasError: false, errorMessage: null, isChunkError: false });
  };

  handleHardReload = (): void => {
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.removeItem(CHUNK_RELOAD_STORAGE_KEY);
      } catch {
        // ignore storage restrictions
      }
      window.location.reload();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <section
          role="alert"
          className="rounded-xl border border-rose-200 dark:border-rose-900/70 bg-white dark:bg-slate-900 p-6 sm:p-8 max-w-2xl mx-auto my-8"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {this.state.isChunkError
                  ? `${this.props.studioName} needs the latest app update`
                  : `${this.props.studioName} encountered a temporary error`}
              </h2>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                {this.state.isChunkError
                  ? 'A newer version of PatternForge was deployed while this tab was open. Reload to sync the updated workspace module — your saved progress and database sync remain intact.'
                  : 'Your saved progress and database sync remain intact. You can retry loading this workspace without reloading the entire application.'}
              </p>
              {this.state.errorMessage && (
                <pre className="mt-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-rose-700 dark:text-rose-300 overflow-x-auto whitespace-pre-wrap">
                  {this.state.errorMessage}
                </pre>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                {this.state.isChunkError && (
                  <button
                    type="button"
                    onClick={this.handleHardReload}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-sky-400 text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Reload Latest Version</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={this.handleRetry}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    this.state.isChunkError
                      ? 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-sky-500'
                      : 'bg-sky-600 hover:bg-sky-700 text-white'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Retry Workspace</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}

export function StudioLoadingSkeleton({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 animate-pulse"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2 flex-1 max-w-md">
          <div className="h-3 w-32 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-6 w-64 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="h-9 w-28 rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="h-24 rounded-lg bg-slate-100 dark:bg-slate-800/70" />
        <div className="h-24 rounded-lg bg-slate-100 dark:bg-slate-800/70" />
        <div className="h-24 rounded-lg bg-slate-100 dark:bg-slate-800/70" />
      </div>
      <span className="sr-only">Loading {label}...</span>
    </div>
  );
}

export interface StudioBoundaryOptions {
  studioName: string;
  fallback?: ReactNode;
}

/**
 * Higher-Order Component isolating a studio or inner tab inside a scoped React
 * Error Boundary and Suspense loader so faults never crash sibling workspaces
 * or interrupt background DB sync.
 */
export function withStudioBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: StudioBoundaryOptions
): ComponentType<P> {
  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || options.studioName;

  const BoundedComponent: React.FC<P> = (props) => (
    <StudioErrorBoundary studioName={options.studioName}>
      <Suspense
        fallback={options.fallback ?? <StudioLoadingSkeleton label={options.studioName} />}
      >
        <WrappedComponent {...props} />
      </Suspense>
    </StudioErrorBoundary>
  );

  BoundedComponent.displayName = `withStudioBoundary(${displayName})`;
  return BoundedComponent;
}

async function importWithRetry<T>(
  loader: () => Promise<T>,
  maxRetries = 2
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await loader();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise((resolve) => window.setTimeout(resolve, 300 * (attempt + 1)));
      }
    }
  }
  // If a stale deployment chunk failed after retries, perform a guarded one-shot reload
  if (isDynamicImportError(lastError)) {
    const reloading = triggerOneShotChunkReload();
    if (reloading) {
      // Keep Suspense visible briefly while the browser navigates to the fresh HTML shell
      return new Promise<T>(() => {});
    }
  }
  throw lastError;
}

/**
 * Resilient Code-Splitting HOC for top-level studios and heavy inner sub-tabs.
 * Features:
 * - Automatic retry with backoff on transient network hiccups
 * - Guarded one-shot page refresh on stale deployment chunk mismatches
 * - Fresh React.lazy instantiation on manual Retry so rejected promises are never stuck
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withLazyStudio<T extends ComponentType<any>>(
  loader: () => Promise<{ default: T }>,
  options: StudioBoundaryOptions
): ComponentType<React.ComponentProps<T>> {
  const LazyBoundedComponent: React.FC<React.ComponentProps<T>> = (props) => {
    const [retryEpoch, setRetryEpoch] = useState(0);

    const LazyModule = useMemo(
      () => lazy(() => importWithRetry(loader)),
      // Re-create React.lazy on retry so React drops any cached rejection
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [retryEpoch]
    );

    return (
      <StudioErrorBoundary
        studioName={options.studioName}
        onRetryReset={() => setRetryEpoch((prev) => prev + 1)}
      >
        <Suspense
          fallback={options.fallback ?? <StudioLoadingSkeleton label={options.studioName} />}
        >
          <LazyModule {...props} />
        </Suspense>
      </StudioErrorBoundary>
    );
  };

  LazyBoundedComponent.displayName = `withLazyStudio(${options.studioName})`;
  return LazyBoundedComponent;
}
