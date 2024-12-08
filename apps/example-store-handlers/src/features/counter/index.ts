import type { Store } from '../../main/store.js';

export const handlers = (setState: Store['setState']) => ({
  'COUNTER:INCREMENT': () => setState((state) => ({ counter: state.counter + 1 })),
  'COUNTER:DECREMENT': () => setState((state) => ({ counter: state.counter - 1 })),
});
