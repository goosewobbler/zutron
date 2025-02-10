import { useStore, type StoreApi } from 'zustand';
import { createStore as createZustandStore } from 'zustand/vanilla';

import type { AnyState, Handlers } from './types.js';
import type { Action, Thunk } from './types.js';

type ExtractState<S> = S extends {
  getState: () => infer T;
}
  ? T
  : never;

type ReadonlyStoreApi<T> = Pick<StoreApi<T>, 'getState' | 'getInitialState' | 'subscribe'>;

let store: StoreApi<AnyState>;

export const createStore = <S extends AnyState>(bridge: Handlers<S>): StoreApi<S> => {
  store = createZustandStore<Partial<S>>((setState: StoreApi<S>['setState']) => {
    // subscribe to changes
    bridge.subscribe((state) => setState(state));

    // get initial state
    bridge.getState().then((state) => setState(state));

    // no state keys - they will all come from main
    return {};
  });

  return store as StoreApi<S>;
};

type UseBoundStore<S extends ReadonlyStoreApi<unknown>> = {
  (): ExtractState<S>;
  <U>(selector: (state: ExtractState<S>) => U): U;
} & S;

export const createUseStore = <S extends AnyState>(bridge: Handlers<S>): UseBoundStore<StoreApi<S>> => {
  const vanillaStore = createStore<S>(bridge);
  const useBoundStore = (selector: (state: S) => unknown) => useStore(vanillaStore, selector);

  Object.assign(useBoundStore, vanillaStore);

  // return store hook
  return useBoundStore as UseBoundStore<StoreApi<S>>;
};

type DispatchFunc<S> = (action: Thunk<S> | Action | string, payload?: unknown) => unknown;

export const useDispatch =
  <S extends AnyState>(bridge: Handlers<S>): DispatchFunc<S> =>
  (action: Thunk<S> | Action | string, payload?: unknown): unknown => {
    if (typeof action === 'function') {
      // passed a function / thunk - so we execute the action, pass dispatch & store getState into it
      const typedStore = store as StoreApi<S>;
      return action(typedStore.getState, bridge.dispatch);
    }

    // passed action type and payload separately
    if (typeof action === 'string') {
      return bridge.dispatch(action, payload);
    }

    // passed an action
    return bridge.dispatch(action);
  };

export { type Handlers } from './types.js';
export { preloadZustandBridge } from './preload.js';
export { mainZustandBridge } from './main.js';
