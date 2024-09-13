import type { BrowserWindow, IpcMain, IpcMainEvent } from 'electron';
import type { StoreApi } from 'zustand';

import type { Action, AnyState, Handler, MainZustandBridgeOpts, Thunk } from './types.js';

export type MainZustandBridge = <State extends AnyState, Store extends StoreApi<State>>(
  ipcMain: IpcMain,
  store: Store,
  windows: BrowserWindow[],
  options?: MainZustandBridgeOpts<State>
) => { unsubscribe: () => void };

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
      store.setState((state) => reducer(state, action as Action));
    } else {
      // default case - handlers attached to store
      const handler = store[actionType as keyof typeof store] as Handler;
      if (typeof handler === 'function') {
        handler(actionPayload);
      }
    }
  };

export const mainZustandBridge: MainZustandBridge = (ipcMain, store, windows, options) => {
  const dispatch = createDispatch(store, options);
  ipcMain.on('subscribe', async (state: unknown) => {
    windows.forEach((window) => {
      if (window?.isDestroyed()) {
        return;
      }
      window?.webContents?.send('subscribe', state);
    });
  });
  ipcMain.on('dispatch', (_event: IpcMainEvent, action: string | Action, payload?: unknown) =>
    dispatch(action, payload)
  );
  ipcMain.handle('getState', () => store.getState());
  const unsubscribe = store.subscribe((state) => ipcMain.emit('subscribe', state));

  return { unsubscribe };
};
