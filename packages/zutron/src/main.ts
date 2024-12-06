import { ipcMain, type IpcMainEvent } from 'electron';
import type { StoreApi } from 'zustand';

import type { Action, AnyState, Handler, MainZustandBridgeOpts, Thunk, WebContentsWrapper } from './types.js';

export type MainZustandBridge = <State extends AnyState, Store extends StoreApi<State>>(
  store: Store,
  windows: WebContentsWrapper[],
  options?: MainZustandBridgeOpts<State>,
) => { unsubscribe: () => void; subscribe: (wrappers: WebContentsWrapper[]) => void };

function sanitizeState(state: AnyState) {
  // strip handlers from the state object
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
      // separate handlers case
      const handler = options.handlers[actionType];
      if (typeof handler === 'function') {
        handler(actionPayload);
      }
    } else if (typeof options?.reducer === 'function') {
      // reducer case - action is passed to the reducer
      const reducer = options.reducer;
      const reducerAction = { type: actionType, payload: actionPayload };
      store.setState((state: State) => reducer(state, reducerAction));
    } else {
      // default case - handlers attached to store
      const state = store.getState();

      const handler = state[actionType as keyof State] as Handler;
      if (typeof handler === 'function') {
        handler(actionPayload);
      }
    }
  };

const subscribe = (wrappers: WebContentsWrapper[]) => {
  ipcMain.on('subscribe', (state: unknown) => {
    for (const wrapper of wrappers) {
      const webContents = wrapper?.webContents;
      if (webContents?.isDestroyed()) {
        break;
      }
      webContents?.send('subscribe', sanitizeState(state as AnyState));
    }
  });
};

export const mainZustandBridge: MainZustandBridge = (store, webContentsWrappers, options) => {
  const dispatch = createDispatch(store, options);

  subscribe(webContentsWrappers);
  ipcMain.on('dispatch', (_event: IpcMainEvent, action: string | Action, payload?: unknown) =>
    dispatch(action, payload),
  );
  ipcMain.handle('getState', () => {
    const state = store.getState();
    return sanitizeState(state);
  });
  const unsubscribe = store.subscribe((state: unknown) => ipcMain.emit('subscribe', state));

  return { unsubscribe, subscribe };
};
