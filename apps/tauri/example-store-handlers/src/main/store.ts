import { createStore } from 'zustand/vanilla';
import { mainZustandBridge } from 'zuri/main';
import { actionHandlers } from '../features/index.js';
import type { State } from '../features/index.js';

const initialState = {
  counter: 0,
};

// Create the Zustand store
export const store = createStore<State>()((setState) => ({
  ...initialState,
  ...actionHandlers(setState, initialState),
}));

// Initialize the bridge immediately and wait for it
let bridgePromise = mainZustandBridge(store);

export const initBridge = async () => {
  try {
    const result = await bridgePromise;
    store.setState(initialState);
    return result; // Important: return the commands
  } catch (err) {
    console.error('Bridge initialization failed:', err);
    throw err;
  }
};

type Subscribe = (listener: (state: State, prevState: State) => void) => () => void;

export type Store = {
  getState: () => State;
  getInitialState: () => State;
  setState: (stateSetter: (state: State) => State) => void;
  subscribe: Subscribe;
};
