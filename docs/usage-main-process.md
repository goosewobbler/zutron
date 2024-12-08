## Accessing the Store in the Main Process

In the main process you can access the store object directly, any updates will be propagated to the renderer process.

The main process dispatch helper can be used to dispatch actions and thunks, in a similar way to the `useDispatch` hook in the renderer process:

```ts
import { createDispatch } from 'zutron/main';

dispatch = createDispatch(store);

dispatch('COUNTER:INCREMENT');
```

By default the main process dispatch helper assumes your store handler functions are located on the store object.

If you keep your store handler functions separate from the store then you will need to pass them in as an option:

```ts
import { handlers as counterHandlers } from '../../features/counter/index.js';
import { handlers as uiHandlers } from '../../features/ui/index.js';

const actionHandlers = (store: AppStore, initialState: AppState) => ({
  ...counterHandlers(store),
  ...uiHandlers(store),
  'STORE:RESET': () => store.setState(initialState, true),
});

dispatch = createDispatch(store, { handlers: actionHandlers(store, initialState) });
```

Alternatively if you are using Redux-style reducers you will need to pass the root reducer in as an option:

```ts
import { reducer as counterReducer } from '../../features/counter/index.js';
import { reducer as uiReducer } from '../../features/ui/index.js';

const rootReducer = (state, action) => {
  switch (action.type) {
    case types.counter:
      return counterReducer(state.counter, action);
    case types.ui:
      return uiReducer(state.ui, action);
  }
};

dispatch = createDispatch(store, { reducer: rootReducer });
```
