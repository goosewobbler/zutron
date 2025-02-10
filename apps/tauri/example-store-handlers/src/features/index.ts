import { handlers as counterHandlers } from './counter/index.js';

export const actionHandlers = (setState: Store['setState'], initialState: State) => ({
  ...counterHandlers(setState),
  'STORE:RESET': () => setState(() => initialState),
});

export type Subscribe = (listener: (state: State, prevState: State) => void) => () => void;
export type Handlers = Record<string, () => void>;
export type State = { counter: number };
export type Store = {
  getState: () => State;
  getInitialState: () => State;
  setState: (stateSetter: (state: State) => State) => void;
  subscribe: Subscribe;
};
