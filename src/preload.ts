import type { IpcRenderer } from 'electron';

import { AnyState, PreloadZustandBridgeReturn } from './types.js';

export const preloadZustandBridge = <S extends AnyState>(ipcRenderer: IpcRenderer): PreloadZustandBridgeReturn<S> => ({
  handlers: {
    dispatch: (...args) => ipcRenderer.send('dispatch', ...args),
    getState: () => ipcRenderer.invoke('getState'),
    subscribe: (callback) => {
      const subscription = (_: unknown, state: S) => callback(state);
      ipcRenderer.on('subscribe', subscription);

      return () => ipcRenderer.off('subscribe', subscription);
    },
  },
});

export type PreloadZustandBridge = typeof preloadZustandBridge;
