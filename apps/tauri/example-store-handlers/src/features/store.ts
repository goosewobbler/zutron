import { createStore } from 'zustand/vanilla';
import type { State } from './index.js';
import { actionHandlers } from './index.js';

const initialState = {
  counter: 0,
};

export const store = createStore<State>()((setState) => ({
  ...initialState,
  ...actionHandlers(setState, initialState),
}));
