import { createStore } from 'zustand/vanilla';
import { State } from '../features/index.js';

export const store = createStore<State>()(() => ({
  counter: 0,
}));
