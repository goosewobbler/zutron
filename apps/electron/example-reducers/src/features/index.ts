import type { Reducer } from 'zutron';

import { counterReducer } from './counter/index.js';

export const rootReducer: Reducer<State> = (state, action) => ({
  counter: counterReducer(state.counter, action),
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
