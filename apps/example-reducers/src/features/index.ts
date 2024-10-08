import type { Reducer } from 'zutron';

import { counterReducer } from './counter/index.js';

export const rootReducer: Reducer<State> = (state: State, action: Action) => ({
  counter: counterReducer(state.counter, action),
});

type Action<T extends string = string> = {
  type: T;
};
export type Dispatch = (a: Action) => Action;
export type Subscribe = (listener: (state: State, prevState: State) => void) => () => void;
export type Handlers = Record<string, () => void>;
export type State = { counter: number };
export type Store = {
  destroy: () => void;
  getState: () => State;
  getInitialState: () => State;
  setState: (stateSetter: (state: State) => State) => void;
  subscribe: Subscribe;
};
