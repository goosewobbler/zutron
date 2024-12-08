import { contextBridge } from 'electron';

import { preloadZustandBridge } from 'zutron/preload';
import 'wdio-electron-service/preload';
import type { Handlers } from 'zutron';

import type { AppState } from '../features/index.js';

export const { handlers } = preloadZustandBridge<AppState>();

contextBridge.exposeInMainWorld('zutron', handlers);

declare global {
  interface Window {
    zutron: Handlers<AppState>;
  }
}
