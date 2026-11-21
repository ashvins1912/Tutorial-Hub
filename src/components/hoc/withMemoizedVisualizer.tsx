import React, { type ComponentType, type NamedExoticComponent } from 'react';

/**
 * Higher-Order Component wrapping heavy SVG/Canvas/Animation visualizers in
 * `React.memo` with a clear DevTools display name to avoid wasted re-renders
 * when parent search inputs, drawers, or unrelated store slices change.
 */
export function withMemoizedVisualizer<P extends object>(
  WrappedComponent: ComponentType<P>,
  arePropsEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
): NamedExoticComponent<P> {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Visualizer';
  const Memoized = React.memo(WrappedComponent, arePropsEqual);
  Memoized.displayName = `withMemoizedVisualizer(${displayName})`;
  return Memoized;
}
