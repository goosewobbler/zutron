import { createStore } from 'zustand/vanilla';
import { State } from '../features/index.js';

export const store = createStore<State>()(() => ({
  counter: 0,
}));

// export const store = createStore<State>()((set) => ({
//   counter: 0,
//   dispatch: (args) => set((state) => rootReducer(state, args)),
// }));

// type ReduxState = State & {
//   dispatch: (a: Action) => Action;
// };

// export const store = createStore<ReduxState>()(
//   redux<ReduxState, Action, [['zustand/redux', Action]]>(rootReducer, { counter: 0 })
// );

// export const store = createStore<ReduxState>()(redux(rootReducer, { counter: 0 }));

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
