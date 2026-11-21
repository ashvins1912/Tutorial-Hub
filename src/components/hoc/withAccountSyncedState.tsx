import React, { type ComponentType, type Dispatch, type SetStateAction } from 'react';
import { useAccountState } from '../../hooks/useAccountState';

export interface InjectedAccountStateProps<T> {
  accountState: T;
  setAccountState: Dispatch<SetStateAction<T>>;
  accountStateHydrated: boolean;
}

export interface AccountSyncHocOptions<T> {
  stateKey: string;
  initialValue: T;
  legacyLocalStorageKey?: string;
}

/**
 * Higher-Order Component that binds a component to DB-synced per-user state
 * via `useAccountState`, preserving exact database persistence keys and
 * optional legacy localStorage migration keys.
 */
export function withAccountSyncedState<T, P extends InjectedAccountStateProps<T>>(
  WrappedComponent: ComponentType<P>,
  options: AccountSyncHocOptions<T>
): ComponentType<Omit<P, keyof InjectedAccountStateProps<T>>> {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const WithAccountStateComponent: React.FC<Omit<P, keyof InjectedAccountStateProps<T>>> = (
    props
  ) => {
    const [accountState, setAccountState, accountStateHydrated] = useAccountState<T>(
      options.stateKey,
      options.initialValue,
      options.legacyLocalStorageKey
    );

    return (
      <WrappedComponent
        {...(props as P)}
        accountState={accountState}
        setAccountState={setAccountState}
        accountStateHydrated={accountStateHydrated}
      />
    );
  };

  WithAccountStateComponent.displayName = `withAccountSyncedState(${options.stateKey})(${displayName})`;
  return WithAccountStateComponent;
}
