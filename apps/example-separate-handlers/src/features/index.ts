import { handlers as counterHandlers } from './counter/index.js';
import type { Store } from '../main/store.js';

export type Handlers = Record<string, () => void>;
export type AppState = { counter: number };

export const actionHandlers = (store: Store, initialState: AppState) => ({
  ...counterHandlers(store),
  'STORE:RESET': () => store.setState(() => initialState),
});
