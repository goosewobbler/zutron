// import type { Store } from '../index.js';

// import { State } from '../index.js';

interface UnknownAction extends Action {
  [extraProps: string]: unknown;
}
type Action<T extends string = string> = {
  type: T;
};
export type Reducer<S = any, A extends Action<string> = UnknownAction, PreloadedState = S> = (
  state: S | PreloadedState,
  action: A
) => S;

export type CounterAction = { type: 'COUNTER:INCREMENT' } | { type: 'COUNTER:DECREMENT' };

export const counterReducer: Reducer<number> = (state, action) => {
  switch (action.type) {
    case 'COUNTER:INCREMENT':
      return state + 1;
    case 'COUNTER:DECREMENT':
      return state - 1;
    default:
      return state;
  }
};

// export const increment = (setState: Store['setState']) => setState((state) => ({ counter: state.counter + 1 }));
// export const decrement = (setState: Store['setState']) => setState((state) => ({ counter: state.counter - 1 }));

// export const handlers = (store: Store) => ({
//   'COUNTER:INCREMENT': () => store.setState((state) => ({ counter: state.counter + 1 })),
//   'COUNTER:DECREMENT': () => store.setState((state) => ({ counter: state.counter - 1 })),
// });
