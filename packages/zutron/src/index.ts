import { StoreApi, UseBoundStore, create } from 'zustand';

import { AnyState, Dispatch, Handlers } from './types.js';

let store: UseBoundStore<StoreApi<Partial<unknown>>>;

export const createUseStore = <S extends AnyState>(bridge: Handlers<S>) => {
  store = create<Partial<S>>((setState: StoreApi<Partial<S>>['setState']) => {
    // subscribe to changes
    bridge.subscribe((state) => setState(state));
    // get initial state
    bridge.getState().then(setState);

    // no state keys - they will all come from main
    return {};
  });

  return store as UseBoundStore<StoreApi<Partial<S>>>;
};

export const createUseDispatch =
  <S extends AnyState>(bridge: Handlers<S>): Dispatch<S> =>
  (action, payload?: unknown) => {
    if (typeof action === 'function') {
      // passed a function / thunk - so we execute the action, pass dispatch & store into it
      return action(bridge.dispatch, store);
    }

    // passed action type and payload separately
    if (typeof action === 'string') {
      return bridge.dispatch(action, payload);
    }

    // passed an action
    return bridge.dispatch(action);
  };

export * from './types.js';
