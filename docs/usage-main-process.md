## Usage in the Main Process

In the main process you can access the store object directly, any updates you make will be propagated to the renderer process of any subscribed window / view.

```ts annotate
// `src/main/counter/index.ts`
import { store } from '../store.js';

// increment counter
const { counter } = store.getState();
store.setState({ counter: counter + 1 });
```

There is a dispatch helper which mirrors the functionality of the [renderer process `useDispatch` hook](./usage-renderer-process.md):

```ts annotate
// `src/main/dispatch.ts`
import { createDispatch } from 'zutron/main';
import { store } from './store.js';

export const dispatch = createDispatch(store);
```

```ts annotate
// `src/main/counter/index.ts`
import { dispatch } from '../dispatch.js';

// dispatch action
dispatch('COUNTER:INCREMENT');

const onIncrementThunk = (getState, dispatch) => {
  // do something based on the store
  ...

  // dispatch action
  dispatch('COUNTER:INCREMENT');
};

// dispatch thunk
dispatch(onIncrementThunk);
```

By default the main process dispatch helper assumes your store handler functions are located on the store object.

If you keep your store handler functions separate from the store then you will need to pass them in as an option:

```ts annotate
// `src/main/dispatch.ts`
import { createDispatch } from 'zutron/main';
import { store } from './store.js';
import { actionHandlers } from '../features/index.js';

export const dispatch = createDispatch(store, { handlers: actionHandlers(store, initialState) });
```

Alternatively, if you are using Redux-style reducers, you should pass in the root reducer:

```ts annotate
// `src/main/dispatch.ts`
import { createDispatch } from 'zutron/main';
import { store } from './store.js';
import { rootReducer } from '../features/index.js';

export const dispatch = createDispatch(store, { reducer: rootReducer });
```
