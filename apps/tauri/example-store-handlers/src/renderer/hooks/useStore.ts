import { createUseStore } from 'zuri';
import { preloadZustandBridge } from 'zuri/preload';
import type { State } from '../../features/index.js';

const { handlers } = preloadZustandBridge<State>();
export const useStore = createUseStore<State>(handlers);
export { handlers };

// Add type declaration
declare global {
  interface Window {
    zuri: typeof handlers;
  }
}
