// import { Action } from '@reduxjs/toolkit';
import { createStore } from 'zustand/vanilla';
// import { redux } from 'zustand/middleware';
import { State } from '../../features/index.js';

export const store = createStore<State>()(() => ({
  counter: 0,
}));

// export const store = createStore<State>()((set) => ({
//   counter: 0,
//   dispatch: (args) => set((state) => rootReducer(state, args)),
// }));

// type ReduxState = {
//   counter: number;
//   dispatch: Dispatch;
//   dispatchFromDevTools: Dispatch
// }

// export const store = createStore<ReduxState>()(redux<State, Action, [['zustand/redux', Action]]>(rootReducer, { counter: 0 }));

// dispatch: (args) => {
//   const newState = {};
//   set((state) =>
//     Object.entries(rootReducer).reduce((newState, reducer) => {
//       const [reducerName, reducerFunc] = reducer;
//       newState[reducerName] = reducerFunc(state, args);
//       return newState;
//     }, newState)
//   );
// },
