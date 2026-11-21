import React, { Component, Suspense, type ComponentType, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface StudioErrorBoundaryProps {
  studioName: string;
  children: ReactNode;
}

interface StudioErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

class StudioErrorBoundary extends Component<
  StudioErrorBoundaryProps,
  StudioErrorBoundaryState
> {
  state: StudioErrorBoundaryState = {
    hasError: false,
    errorMessage: null,
  };

  static getDerivedStateFromError(error: Error): StudioErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unexpected rendering error.',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error(`[StudioBoundary:${this.props.studioName}]`, error, info.componentStack);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, errorMessage: null });
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
                {this.props.studioName} encountered a temporary error
              </h2>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                Your saved progress and database sync remain intact. You can retry loading this
                workspace without reloading the entire application.
              </p>
              {this.state.errorMessage && (
                <pre className="mt-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-rose-700 dark:text-rose-300 overflow-x-auto whitespace-pre-wrap">
                  {this.state.errorMessage}
                </pre>
              )}
              <button
                type="button"
                onClick={this.handleRetry}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Retry Workspace</span>
              </button>
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
 * Higher-Order Component isolating a studio/view inside a scoped React Error
 * Boundary and Suspense loader so code-split chunks load smoothly and faults
 * never crash sibling workspaces or interrupt background DB sync.
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
