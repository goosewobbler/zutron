import type { Reducer } from 'zutron';

import { counterReducer } from './counter/index.js';

export type AppState = { counter: number };

export const rootReducer: Reducer<AppState> = (state, action) => ({
  counter: counterReducer(state.counter, action),
});
