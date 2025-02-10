import { createStore } from 'zustand/vanilla';

import type { State } from '../features/index.js';

export const initialState = {
  counter: 0,
};

export const store = createStore<State>()(() => initialState);
