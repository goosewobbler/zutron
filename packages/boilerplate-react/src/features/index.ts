import { Action, combineReducers } from '@reduxjs/toolkit';
import { Reducer, counterReducer, handlers as counterHandlers } from './counter/counter.js';

export const rootReducer: Reducer = combineReducers({ counter: counterReducer });

export type Dispatch = (a: Action) => Action;
export type Subscribe = (listener: () => void) => () => void;
export type Handlers = Record<string, () => void>;
export type State = { counter: number };
export type Store = {
  setState: (stateSetter: (state: State) => State) => void;
  getState: () => State;
  subscribe: Subscribe;
};

export const getHandlers = (store: Store) => ({
  ...counterHandlers(store),
});
