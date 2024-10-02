import { contextBridge, ipcRenderer } from 'electron';
import { preloadZustandBridge } from 'zutron/preload';
import type { Handlers } from 'zutron';

import type { State } from '../features/index.js' with { 'resolution-mode': 'import' };

export const { handlers } = preloadZustandBridge<State>(ipcRenderer);

contextBridge.exposeInMainWorld('electron', handlers);

declare global {
  interface Window {
    electron: Handlers<State>;
  }
}
