import type { Store } from '../../main/store.js';

export const handlers = (store: Store) => ({
  'COUNTER:INCREMENT': () => store.setState((state) => ({ counter: state.counter + 1 })),
  'COUNTER:DECREMENT': () => store.setState((state) => ({ counter: state.counter - 1 })),
});
