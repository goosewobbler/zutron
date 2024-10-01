import { create, type StoreApi, type UseBoundStore } from 'zustand';

import type { AnyState, Dispatch, Handlers } from './index.js' with { 'resolution-mode': 'import' };
import { Thunk } from './types.js';

let store: UseBoundStore<StoreApi<unknown>>;

export const createUseStore = <S extends AnyState>(bridge: Handlers<S>) => {
  store = create<Partial<S>>((setState: StoreApi<S>['setState']) => {
    // subscribe to changes
    bridge.subscribe((state) => setState(state));
    // get initial state
    bridge.getState().then(setState);

    // no state keys - they will all come from main
    return {};
  });

  return store as UseBoundStore<StoreApi<S>>;
};

export const createUseDispatch =
  <S extends AnyState>(bridge: Handlers<S>): Dispatch<S> =>
  (action, payload?: unknown) => {
    if (typeof action === 'function') {
      // passed a function / thunk - so we execute the action, pass dispatch & store into it
      const thunk = action as Thunk<unknown>;
      return thunk(bridge.dispatch, store);
    }

    // passed action type and payload separately
    if (typeof action === 'string') {
      return bridge.dispatch(action, payload);
    }

    // passed an action
    return bridge.dispatch(action);
  };

export type * from './types.js';
