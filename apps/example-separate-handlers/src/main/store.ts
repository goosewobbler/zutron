import { createStore } from 'zustand/vanilla';

import type { AppState } from '../features/index.js';

type Subscribe = (listener: (state: AppState, prevState: AppState) => void) => () => void;

export type Store = {
  getState: () => AppState;
  getInitialState: () => AppState;
  setState: (stateSetter: (state: AppState) => AppState) => void;
  subscribe: Subscribe;
};

export const initialState: AppState = {
  counter: 0,
};

export const store = createStore<AppState>()(() => initialState);
