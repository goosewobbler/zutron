import { handlers as counterHandlers } from './counter/index.js';
import type { Store } from '../main/store.js';

export type AppState = { counter: number };

export const actionHandlers = (setState: Store['setState'], initialState: AppState) => ({
  ...counterHandlers(setState),
  'STORE:RESET': () => setState(() => initialState),
});
