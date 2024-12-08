## Getting Started

Install Zutron and peer dependencies:

```bash
npm i zutron zustand
```

Or use your dependency manager of choice, e.g. `pnpm`, `yarn`.

The code fragments in this documentation are based on the minimal working (TypeScript) examples found in the [apps directory](../apps).

#### Create Store

First, create the Zustand store for your application using `zustand/vanilla` in the main process. If you are using TS, provide your application state type:

```ts annotate
// `src/main/store.ts`
import { createStore } from 'zustand/vanilla';
import type { AppState } from '../features/index.js';

const initialState: AppState = {
  counter: 0,
  ui: { ... }
};

// create app store
export const store = createStore<AppState>()(() => initialState);
```

#### Instantiate Bridge in Main process

In the main process, the bridge needs to be instantiated with your store and an array of window or view objects for your app. `BrowserWindow`, `BrowserView` and `WebContentsView` objects are supported.

The bridge returns an `unsubscribe` function which can be used to deactivate the bridge, and a `subscribe` function which can be used to enable any additional windows or views created after the bridge was initialised.

So, for a single window application:

```ts annotate
// `src/main/index.ts`
import { app, BrowserWindow } from 'electron';
import { mainZustandBridge } from 'zutron/main';

// create main window
const mainWindow = new BrowserWindow({ ... });

// instantiate bridge
const { unsubscribe } = mainZustandBridge(store, [mainWindow]);

// unsubscribe on quit
app.on('quit', unsubscribe);
```

For a multi-window application:

```ts annotate
// `src/main/index.ts`
import { app, BrowserWindow, WebContentsView } from 'electron';
import { mainZustandBridge } from 'zutron/main';

// create main window
const mainWindow = new BrowserWindow({ ... });

// create secondary window
const secondaryWindow = new BrowserWindow({ ... });

// instantiate bridge
const { unsubscribe, subscribe } = mainZustandBridge(store, [mainWindow, secondaryWindow]);

// unsubscribe on quit
app.on('quit', unsubscribe);

// create a view some time after the bridge has been instantiated
const runtimeView = new WebContentsView({ ... });

// subscribe the view to store updates
subscribe([runtimeView]);
```

By default the main process bridge assumes your store handler functions are located on the store object.

If you keep your store handler functions separate from the store then you will need to pass them in as an option:

```ts annotate
// `src/main/index.ts`
import { mainZustandBridge } from 'zutron/main';
import { actionHandlers } from '../features/index.js';

// create handlers for store
const handlers = actionHandlers(store, initialState);

// instantiate bridge
const { unsubscribe } = mainZustandBridge(store, [mainWindow], { handlers });
```

Alternatively, if you are using Redux-style reducers, you should pass in the root reducer:

```ts annotate
// `src/features/index.ts`
import type { Reducer } from 'zutron';
import { counterReducer } from '../features/counter/index.js';
import { uiReducer } from '../features/ui/index.js';

export type AppState = {
  counter: number
  ui: { ... }
};

// create root reducer
export const rootReducer: Reducer<AppState> = (state, action) => ({
  counter: counterReducer(state.counter, action),
  ui: uiReducer(state.ui, action)
});
```

```ts annotate
// `src/main/index.ts`
import { app, BrowserWindow } from 'electron';
import { mainZustandBridge } from 'zutron/main';
import { rootReducer } from '../features/index.js'

// create main window
const mainWindow = new BrowserWindow({ ... });

// instantiate bridge
const { unsubscribe } = mainZustandBridge(store, [mainWindow], { reducer: rootReducer });

// unsubscribe on quit
app.on('quit', unsubscribe);
```

#### Instantiate Bridge in Preload

Next, instantiate the bridge in your preload script. If you are using TS, the bridge needs the type of your app state.

The preload bridge function will return a set of handlers which you need to expose to the renderer process via the Electron `contextBridge` module.

```ts annotate
// `src/preload/index.ts`
import { contextBridge } from 'electron';
import { preloadZustandBridge } from 'zutron/preload';
import type { Handlers } from 'zutron';
import type { AppState } from '../features/index.js';

// instantiate bridge
export const { handlers } = preloadZustandBridge<AppState>();

// expose handlers to renderer process
contextBridge.exposeInMainWorld('zutron', handlers);

// declare handlers type
declare global {
  interface Window {
    zutron: Handlers<AppState>;
  }
}
```

#### Create hook in Renderer process

Finally, in the renderer process you will need to create the `useStore` hook. This requires the `window.zutron` object exposed by the preload bridge:

```ts annotate
// `src/renderer/hooks/useStore.ts`
import { createUseStore } from 'zutron';
import type { AppState } from '../../features/index.js';

export const useStore = createUseStore<AppState>(window.zutron);
```

You should now be ready to start using Zutron. See the below pages for how to access the store and dispatch actions in the different Electron processes:

[Usage - main process](./usage-main-process.md)
[Usage - renderer process](./usage-renderer-process.md)
