import { createStore } from 'zustand/vanilla';

import { actionHandlers } from '../features/index.js';

export type State = { counter: number };

const initialState = {
  counter: 0,
};

export const store = createStore<State>()((setState) => ({
  ...initialState,
  ...actionHandlers(setState, initialState),
}));

type Subscribe = (listener: (state: State, prevState: State) => void) => () => void;

export type Store = {
  getState: () => State;
  getInitialState: () => State;
  setState: (stateSetter: (state: State) => State) => void;
  subscribe: Subscribe;
};
