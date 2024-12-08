import { handlers as counterHandlers } from './counter/index.js';

export type Subscribe = (listener: (state: AppState, prevState: AppState) => void) => () => void;
export type Handlers = Record<string, () => void>;
export type AppState = { counter: number };
export type Store = {
  getState: () => AppState;
  getInitialState: () => AppState;
  setState: (stateSetter: (state: AppState) => AppState) => void;
  subscribe: Subscribe;
};

export const actionHandlers = (setState: Store['setState'], initialState: AppState) => ({
  ...counterHandlers(setState),
  'STORE:RESET': () => setState(() => initialState),
});
