import { emit, listen } from '@tauri-apps/api/event';
import type { StoreApi } from 'zustand';
import { invoke } from '@tauri-apps/api/tauri';

import type { Action, AnyState, Handler, MainZustandBridgeOpts, Thunk } from './types.js';

export type MainZustandBridge = <State extends AnyState, Store extends StoreApi<State>>(
  store: Store,
  options?: MainZustandBridgeOpts<State>,
) => Promise<{
  unsubscribe: () => void;
  commands: Record<string, (...args: any[]) => Promise<unknown>>;
}>;

function sanitizeState(state: AnyState) {
  const safeState: Record<string, unknown> = {};

  for (const statePropName in state) {
    const stateProp = state[statePropName];
    if (typeof stateProp !== 'function') {
      safeState[statePropName] = stateProp;
    }
  }

  return safeState;
}

export const createDispatch =
  <State extends AnyState, Store extends StoreApi<State>>(store: Store, options?: MainZustandBridgeOpts<State>) =>
  (action: string | Action | Thunk<State>, payload?: unknown) => {
    const actionType = (action as Action).type || (action as string);
    const actionPayload = (action as Action).payload || payload;

    if (options?.handlers) {
      const handler = options.handlers[actionType];
      if (typeof handler === 'function') {
        handler(actionPayload);
      }
    } else if (typeof options?.reducer === 'function') {
      const reducer = options.reducer;
      const reducerAction = { type: actionType, payload: actionPayload };
      store.setState((state) => reducer(state, reducerAction));
    } else {
      const state = store.getState();
      const handler = state[actionType as keyof State] as Handler;
      if (typeof handler === 'function') {
        handler(actionPayload);
      }
    }
  };

export const mainZustandBridge = async <State extends AnyState, Store extends StoreApi<State>>(
  store: Store,
  options?: MainZustandBridgeOpts<State>,
) => {
  const dispatch = createDispatch(store, options);

  // Set up event listeners first
  const unlisten = await listen<Action>('zuri:action', (event) => {
    dispatch(event.payload);
  });

  // Subscribe to store changes to update UI
  const unsubscribeStore = store.subscribe((state) => {
    emit('zuri:state-update', sanitizeState(state));
  });

  // Get initial state from Rust
  try {
    const initialState = await invoke('zuri:get-state');
    store.setState(initialState as State);
  } catch (err) {
    console.error('Failed to get initial state:', err);
  }

  return {
    unsubscribe: () => {
      unlisten();
      unsubscribeStore();
    },
  };
};
