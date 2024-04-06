import { contextBridge, ipcRenderer } from 'electron';
import { preloadZustandBridge } from 'zutron/preload';

import type { State } from '../features/index.js';

export const { handlers } = preloadZustandBridge<State>(ipcRenderer);

contextBridge.exposeInMainWorld('electron', handlers);
