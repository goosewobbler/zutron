## Getting Started

Install Zutron and peer dependencies:

```bash
npm i zutron zustand
```

Or use your dependency manager of choice, e.g. `pnpm`, `yarn`.

The following instructions assume you are using TypeScript.

#### Create Store

First, create your Zustand store using `zustand/vanilla` in the main process:

```ts
import { createStore } from 'zustand/vanilla';

store = createStore<AppState>()(() => initialState);
```

#### Initialize Bridge in Main process

In the main process, the bridge needs your store and an array of window or view objects for your app. `BrowserWindow`, `BrowserView` and `WebContentsView` objects are supported.

So, for a single window application:

```ts
import { mainZustandBridge } from 'zutron/main';

// create mainWindow
const mainWindow = new BrowserWindow(windowConfig);

const { unsubscribe } = mainZustandBridge(store, [mainWindow]);

app.on('quit', unsubscribe);
```

#### Initialize Bridge in Preload

Next, initialise the bridge in your preload script. Here the bridge needs the type of your app state. The bridge initialiser will return a set of handlers which should be exposed to the renderer process via the `contextBridge` module.

```ts
import { contextBridge } from 'electron';
import { preloadZustandBridge } from 'zutron/preload';

import type { AppState } from '../features/index.js';

export const { handlers } = preloadZustandBridge<AppState>();

contextBridge.exposeInMainWorld('zutron', handlers);
```

#### Create hook in Renderer process

Finally, in the renderer process you will need to create the `useStore` hook:

`/renderer/hooks/useStore.ts`

```ts
import { createUseStore } from 'zutron';
import { AppState } from '../../features/index.js';

export const useStore = createUseStore<AppState>(window.zutron);
```

#### Accessing the Store in the Renderer Process

In the renderer process you should now be able to access the store via the `useStore` hook:

```ts
const counter = useStore((x) => x.counter);
```

You can use the `useDispatch` hook to dispatch actions and thunks to the store:

```ts
const dispatch = useDispatch(window.zutron);
const onIncrement = () => dispatch('COUNTER:INCREMENT');
```

If you are using a thunk, the dispatch function and the store are passed in:

```ts
const onIncrementThunk = (getState, dispatch) => {
  // do something based on the store
  dispatch('COUNTER:INCREMENT');
};
const dispatch = useDispatch(window.zutron);
const onIncrement = () => dispatch(onIncrementThunk);
```

#### Accessing the Store in the Main Process

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
