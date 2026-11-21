import React, { type ComponentType } from 'react';
import type {
  CanonicalBundlePayloadMap,
  ContentBundleKey,
} from '../../data/canonicalDataRegistry';
import { type AsyncCatalogResult, useAsyncCatalog } from '../../hooks/useAsyncCatalog';

export interface InjectedCatalogProps<K extends ContentBundleKey> {
  catalog: CanonicalBundlePayloadMap[K];
  catalogMeta: Omit<AsyncCatalogResult<K>, 'data'>;
}

/**
 * Higher-Order Component that hydrates a single canonical database bundle via
 * Zustand's lazy `useAsyncCatalog` hook and injects typed `catalog` +
 * `catalogMeta` props while preserving instant zero-flicker local fallback.
 */
export function withAsyncCatalog<
  K extends ContentBundleKey,
  P extends InjectedCatalogProps<K>,
>(
  WrappedComponent: ComponentType<P>,
  bundleKey: K
): ComponentType<Omit<P, keyof InjectedCatalogProps<K>>> {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const WithCatalogComponent: React.FC<Omit<P, keyof InjectedCatalogProps<K>>> = (props) => {
    const { data, status, source, isLoading, error, refresh } = useAsyncCatalog(bundleKey);

    return (
      <WrappedComponent
        {...(props as P)}
        catalog={data}
        catalogMeta={{ status, source, isLoading, error, refresh }}
      />
    );
  };

  WithCatalogComponent.displayName = `withAsyncCatalog(${bundleKey})(${displayName})`;
  return WithCatalogComponent;
}
