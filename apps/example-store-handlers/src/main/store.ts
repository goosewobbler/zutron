import { createStore } from 'zustand/vanilla';

import { actionHandlers, type AppState } from '../features/index.js';

const initialState: AppState = {
  counter: 0,
};

export const store = createStore<AppState>()((setState) => ({
  ...initialState,
  ...actionHandlers(setState, initialState),
}));

type Subscribe = (listener: (state: AppState, prevState: AppState) => void) => () => void;

export type Store = {
  getState: () => AppState;
  getInitialState: () => AppState;
  setState: (stateSetter: (state: AppState) => AppState) => void;
  subscribe: Subscribe;
};
