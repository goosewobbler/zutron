import { PreloadZustandBridgeReturn } from 'zutron/preload';
import type { State, Action } from '../features';

declare global {
  interface Window {
    electron: PreloadZustandBridgeReturn<State, Action>['handlers'];
  }
}

// export {};
